"""Autenticação própria: cadastro, login, renovação, saída e recuperação de senha."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..deps import cuidador_atual
from ..models import (
    Consentimento,
    Cuidador,
    CuidadorPaciente,
    Paciente,
    RefreshToken,
    TokenRedefinicao,
    Usuario,
)
from ..schemas import (
    CadastroEntrada,
    EsqueciEntrada,
    LoginEntrada,
    RedefinirEntrada,
    TokenSaida,
    UsuarioSaida,
)
from ..security import (
    criar_access_token,
    gerar_hash,
    hash_token,
    politica_senha,
    token_opaco,
    verificar_senha,
)
from ..services import email

router = APIRouter(prefix="/auth", tags=["autenticação"])

COOKIE = "cogni_refresh"
_falhas: dict[str, deque[float]] = defaultdict(deque)


def _usuario_saida(c: Cuidador) -> UsuarioSaida:
    return UsuarioSaida(
        id=c.id,
        email=c.usuario.email,
        nome_completo=c.nome_completo,
        telefone=c.telefone,
        tipo_vinculo=c.tipo_vinculo,
        nome_instituicao=c.nome_instituicao,
    )


def _emitir(db: Session, response: Response, cuidador: Cuidador) -> TokenSaida:
    s = get_settings()
    token, hash_ = token_opaco()
    db.add(RefreshToken(
        usuario_id=cuidador.id,
        token_hash=hash_,
        expira_em=datetime.now(UTC) + timedelta(days=s.refresh_token_dias),
    ))
    db.commit()
    response.set_cookie(
        COOKIE, token, httponly=True, secure=s.cookie_seguro, samesite="strict",
        max_age=s.refresh_token_dias * 86400, path=s.cookie_path,
    )
    return TokenSaida(access_token=criar_access_token(cuidador.id), usuario=_usuario_saida(cuidador))


def _limite(chave: str) -> None:
    s = get_settings()
    janela = s.login_janela_minutos * 60
    fila = _falhas[chave]
    while fila and time.monotonic() - fila[0] > janela:
        fila.popleft()
    if len(fila) >= s.login_max_falhas:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Muitas tentativas. Aguarde alguns minutos.")


@router.post("/cadastro", response_model=TokenSaida, status_code=201)
def cadastro(dados: CadastroEntrada, response: Response, db: Session = Depends(get_db)) -> TokenSaida:
    if not dados.aceite_termo:
        raise HTTPException(422, "É preciso aceitar o termo de uso e privacidade.")
    if erro := politica_senha(dados.senha):
        raise HTTPException(422, erro)
    email_norm = dados.email.strip().lower()
    if db.scalar(select(Usuario).where(Usuario.email == email_norm)):
        raise HTTPException(409, "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.")

    # Uma única transação: usuário, perfil, consentimento e, se houver, a pessoa idosa.
    usuario = Usuario(email=email_norm, senha_hash=gerar_hash(dados.senha))
    cuidador = Cuidador(
        usuario=usuario,
        nome_completo=dados.nome_completo.strip(),
        telefone=dados.telefone,
        tipo_vinculo=dados.tipo_vinculo,
        nome_instituicao=dados.nome_instituicao if dados.tipo_vinculo == "Instituição" else None,
    )
    db.add_all([usuario, cuidador])
    db.flush()
    db.add(Consentimento(usuario_id=usuario.id, finalidade="uso_do_servico", versao_termo=dados.versao_termo))
    if dados.idoso:
        paciente = Paciente(**dados.idoso.model_dump())
        db.add(paciente)
        db.flush()
        db.add(CuidadorPaciente(cuidador_id=cuidador.id, paciente_id=paciente.id, papel="principal"))
    db.flush()
    return _emitir(db, response, cuidador)


@router.post("/login", response_model=TokenSaida)
def login(dados: LoginEntrada, request: Request, response: Response, db: Session = Depends(get_db)) -> TokenSaida:
    email_norm = dados.email.strip().lower()
    chave = f"{email_norm}|{request.client.host if request.client else ''}"
    _limite(chave)
    usuario = db.scalar(select(Usuario).where(Usuario.email == email_norm))
    if not usuario or not usuario.ativo or not verificar_senha(dados.senha, usuario.senha_hash):
        _falhas[chave].append(time.monotonic())
        raise HTTPException(401, "E-mail ou senha incorretos.")
    _falhas.pop(chave, None)
    return _emitir(db, response, usuario.cuidador)


@router.post("/refresh", response_model=TokenSaida)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)) -> TokenSaida:
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(401, "Sessão encerrada.")
    registro = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(token)))
    agora = datetime.now(UTC)
    if not registro or registro.revogado or _aware(registro.expira_em) < agora:
        response.delete_cookie(COOKIE, path=get_settings().cookie_path)
        raise HTTPException(401, "Sessão encerrada.")
    registro.revogado = True  # rotação: cada token de renovação vale uma vez
    cuidador = db.get(Cuidador, registro.usuario_id)
    return _emitir(db, response, cuidador)


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> None:
    token = request.cookies.get(COOKIE)
    if token:
        registro = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(token)))
        if registro:
            registro.revogado = True
            db.commit()
    response.delete_cookie(COOKIE, path=get_settings().cookie_path)


@router.get("/eu", response_model=UsuarioSaida)
def eu(cuidador: Cuidador = Depends(cuidador_atual)) -> UsuarioSaida:
    return _usuario_saida(cuidador)


@router.post("/esqueci-senha", status_code=202)
def esqueci_senha(dados: EsqueciEntrada, db: Session = Depends(get_db)) -> dict:
    """Sempre responde igual, exista ou não o e-mail, para não revelar quem tem conta."""
    s = get_settings()
    usuario = db.scalar(select(Usuario).where(Usuario.email == dados.email.strip().lower()))
    if usuario and usuario.ativo:
        token, hash_ = token_opaco()
        db.add(TokenRedefinicao(
            usuario_id=usuario.id,
            token_hash=hash_,
            expira_em=datetime.now(UTC) + timedelta(minutes=s.reset_token_minutos),
        ))
        db.commit()
        link = f"{s.frontend_url}/redefinir-senha?token={token}"
        email.enviar(
            usuario.email,
            "Cogni: redefinição de senha",
            f"Para criar uma nova senha, acesse o link abaixo (válido por {s.reset_token_minutos} minutos):\n\n"
            f"{link}\n\nSe você não pediu a redefinição, ignore esta mensagem.",
        )
    return {"mensagem": "Se o e-mail estiver cadastrado, enviaremos um link de redefinição."}


@router.post("/redefinir-senha", status_code=204)
def redefinir_senha(dados: RedefinirEntrada, db: Session = Depends(get_db)) -> None:
    registro = db.scalar(select(TokenRedefinicao).where(TokenRedefinicao.token_hash == hash_token(dados.token)))
    if not registro or registro.usado or _aware(registro.expira_em) < datetime.now(UTC):
        raise HTTPException(400, "Link inválido ou expirado. Peça um novo.")
    if erro := politica_senha(dados.nova_senha):
        raise HTTPException(422, erro)
    usuario = db.get(Usuario, registro.usuario_id)
    usuario.senha_hash = gerar_hash(dados.nova_senha)
    registro.usado = True
    # encerra as sessões abertas em outros dispositivos
    for rt in db.scalars(select(RefreshToken).where(RefreshToken.usuario_id == usuario.id)):
        rt.revogado = True
    db.commit()


def _aware(d: datetime) -> datetime:
    return d if d.tzinfo else d.replace(tzinfo=UTC)
