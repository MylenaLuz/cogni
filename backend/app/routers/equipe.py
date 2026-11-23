"""Quem acompanha cada pessoa: papéis, convites por código e instituições com gestor e equipe."""

from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import PODE_GERENCIAR, carregar_paciente, cuidador_atual, gestor_de, papel_sobre
from ..models import Convite, Cuidador, CuidadorPaciente, Instituicao, MembroInstituicao, Paciente
from ..schemas import (
    AceitarConviteEntrada,
    AtribuirEntrada,
    ConviteAceito,
    ConviteInstituicaoEntrada,
    ConvitePessoaEntrada,
    ConviteSaida,
    InstituicaoEntrada,
    InstituicaoSaida,
    MembroSaida,
    PapelEntrada,
    PessoaDaInstituicao,
    VinculoSaida,
)
from ..security import hash_token

router = APIRouter(tags=["equipe"])

VALIDADE_CONVITE = timedelta(days=7)
# sem 0/O, 1/I/L: o código é lido em voz alta ou copiado à mão
ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def _novo_codigo() -> str:
    c = "".join(secrets.choice(ALFABETO) for _ in range(8))
    return f"{c[:4]}-{c[4:]}"


def _normalizar(codigo: str) -> str:
    c = "".join(ch for ch in codigo.upper() if ch.isalnum())
    return f"{c[:4]}-{c[4:]}"


def _emitir_convite(db: Session, criador: Cuidador, papel: str, **alvo) -> ConviteSaida:
    codigo = _novo_codigo()
    expira = datetime.now(UTC) + VALIDADE_CONVITE
    db.add(Convite(codigo_hash=hash_token(codigo), papel=papel, criado_por=criador.id, expira_em=expira, **alvo))
    db.commit()
    return ConviteSaida(codigo=codigo, papel=papel, expira_em=expira)


def _vinculos(db: Session, paciente_id: uuid.UUID) -> list[CuidadorPaciente]:
    return list(
        db.scalars(
            select(CuidadorPaciente)
            .where(CuidadorPaciente.paciente_id == paciente_id, CuidadorPaciente.ativo.is_(True))
            .order_by(CuidadorPaciente.criado_em)
        )
    )


def _vinculo_saida(v: CuidadorPaciente, eu: Cuidador) -> VinculoSaida:
    return VinculoSaida(
        cuidador_id=v.cuidador_id, nome=v.cuidador.nome_completo, papel=v.papel, voce=v.cuidador_id == eu.id
    )


def _garantir_responsavel(vinculos: list[CuidadorPaciente], saindo: uuid.UUID, novo_papel: str | None) -> None:
    """Toda pessoa precisa de pelo menos um responsável."""
    restantes = [v for v in vinculos if v.papel == "responsavel" and v.cuidador_id != saindo]
    if not restantes and novo_papel != "responsavel":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A pessoa precisa de pelo menos um responsável. Defina outro responsável antes."
        )


# --- acompanhamento de uma pessoa ------------------------------------------------------------


@router.get("/pacientes/{paciente_id}/vinculos", response_model=list[VinculoSaida])
def listar_vinculos(paciente_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)):
    carregar_paciente(db, c, paciente_id)
    db.commit()
    return [_vinculo_saida(v, c) for v in _vinculos(db, paciente_id)]


@router.post("/pacientes/{paciente_id}/convites", response_model=ConviteSaida, status_code=201)
def convidar_para_pessoa(
    paciente_id: uuid.UUID,
    dados: ConvitePessoaEntrada,
    db: Session = Depends(get_db),
    c: Cuidador = Depends(cuidador_atual),
) -> ConviteSaida:
    p = carregar_paciente(db, c, paciente_id, acao="convite", exigir=PODE_GERENCIAR)
    return _emitir_convite(db, c, dados.papel, paciente_id=p.id)


@router.patch("/pacientes/{paciente_id}/vinculos/{cuidador_id}", response_model=VinculoSaida)
def mudar_papel(
    paciente_id: uuid.UUID,
    cuidador_id: uuid.UUID,
    dados: PapelEntrada,
    db: Session = Depends(get_db),
    c: Cuidador = Depends(cuidador_atual),
) -> VinculoSaida:
    carregar_paciente(db, c, paciente_id, acao="alteracao", exigir=PODE_GERENCIAR)
    vinculos = _vinculos(db, paciente_id)
    alvo = next((v for v in vinculos if v.cuidador_id == cuidador_id), None)
    if alvo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Essa pessoa não acompanha mais este cadastro.")
    if alvo.papel == "responsavel":
        _garantir_responsavel(vinculos, cuidador_id, dados.papel)
    alvo.papel = dados.papel
    db.commit()
    return _vinculo_saida(alvo, c)


@router.delete("/pacientes/{paciente_id}/vinculos/{cuidador_id}", status_code=204)
def remover_vinculo(
    paciente_id: uuid.UUID, cuidador_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> None:
    """O responsável (ou o gestor) remove alguém; qualquer cuidador pode deixar de acompanhar."""
    proprio = cuidador_id == c.id
    carregar_paciente(db, c, paciente_id, acao="alteracao", exigir=None if proprio else PODE_GERENCIAR)
    vinculos = _vinculos(db, paciente_id)
    alvo = next((v for v in vinculos if v.cuidador_id == cuidador_id), None)
    if alvo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Essa pessoa não acompanha mais este cadastro.")
    if alvo.papel == "responsavel":
        _garantir_responsavel(vinculos, cuidador_id, None)
    db.delete(alvo)
    db.commit()


@router.post("/pacientes/{paciente_id}/vinculos", response_model=VinculoSaida, status_code=201)
def atribuir_membro(
    paciente_id: uuid.UUID, dados: AtribuirEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> VinculoSaida:
    """O gestor atribui um profissional da equipe a uma pessoa da instituição."""
    p = carregar_paciente(db, c, paciente_id, acao="alteracao", exigir=frozenset({"gestor"}))
    membro = db.scalar(
        select(MembroInstituicao).where(
            MembroInstituicao.cuidador_id == dados.cuidador_id, MembroInstituicao.instituicao_id == p.instituicao_id
        )
    )
    if membro is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profissional não encontrado na equipe.")
    vinculos = _vinculos(db, p.id)
    v = next((x for x in vinculos if x.cuidador_id == dados.cuidador_id), None)
    if v is None:
        v = CuidadorPaciente(cuidador_id=dados.cuidador_id, paciente_id=p.id, papel=dados.papel)
        db.add(v)
    else:
        if v.papel == "responsavel":
            _garantir_responsavel(vinculos, v.cuidador_id, dados.papel)
        v.papel = dados.papel
    db.commit()
    db.refresh(v)
    return _vinculo_saida(v, c)


# --- aceitar convite -------------------------------------------------------------------------


@router.post("/convites/aceitar", response_model=ConviteAceito)
def aceitar_convite(
    dados: AceitarConviteEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> ConviteAceito:
    convite = db.scalar(select(Convite).where(Convite.codigo_hash == hash_token(_normalizar(dados.codigo))))
    agora = datetime.now(UTC)
    if convite is None or convite.usado_em is not None or _aware(convite.expira_em) < agora:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Código inválido, já usado ou vencido.")

    if convite.paciente_id is not None:
        p = db.get(Paciente, convite.paciente_id)
        if p is None or not p.ativo:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Código inválido, já usado ou vencido.")
        if papel_sobre(db, c, p) is not None:
            raise HTTPException(status.HTTP_409_CONFLICT, "Você já acompanha esta pessoa.")
        db.add(CuidadorPaciente(cuidador_id=c.id, paciente_id=p.id, papel=convite.papel))
        resultado = ConviteAceito(tipo="pessoa", nome=p.nome_completo, papel=convite.papel, paciente_id=p.id)
    else:
        if c.membro is not None:
            raise HTTPException(status.HTTP_409_CONFLICT, "Você já faz parte de uma instituição.")
        inst = db.get(Instituicao, convite.instituicao_id)
        db.add(MembroInstituicao(instituicao_id=inst.id, cuidador_id=c.id, papel=convite.papel))
        resultado = ConviteAceito(tipo="instituicao", nome=inst.nome, papel=convite.papel)

    convite.usado_em, convite.usado_por = agora, c.id
    db.commit()
    return resultado


# --- instituição ----------------------------------------------------------------------------


def _membro(c: Cuidador) -> MembroInstituicao:
    if c.membro is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Você não faz parte de uma instituição.")
    return c.membro


def _exigir_gestor(c: Cuidador) -> MembroInstituicao:
    m = _membro(c)
    if m.papel != "gestor":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Apenas o gestor da instituição pode fazer isso.")
    return m


def criar_instituicao(db: Session, c: Cuidador, nome: str) -> Instituicao:
    inst = Instituicao(nome=nome.strip())
    db.add(inst)
    db.flush()
    db.add(MembroInstituicao(instituicao_id=inst.id, cuidador_id=c.id, papel="gestor"))
    db.flush()
    db.refresh(c)
    return inst


@router.post("/instituicao", response_model=InstituicaoSaida, status_code=201)
def nova_instituicao(
    dados: InstituicaoEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> InstituicaoSaida:
    if c.membro is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Você já faz parte de uma instituição.")
    criar_instituicao(db, c, dados.nome)
    c.nome_instituicao = dados.nome.strip()
    db.commit()
    return minha_instituicao(db, c)


@router.get("/instituicao", response_model=InstituicaoSaida)
def minha_instituicao(db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> InstituicaoSaida:
    m = _membro(c)
    inst = m.instituicao
    membros = sorted(inst.membros, key=lambda x: (x.papel != "gestor", x.cuidador.nome_completo))
    pessoas: list[PessoaDaInstituicao] = []
    if m.papel == "gestor":
        for p in sorted((p for p in inst.pacientes if p.ativo), key=lambda p: p.nome_completo):
            pessoas.append(
                PessoaDaInstituicao(
                    id=p.id, nome=p.nome_completo, cuidadores=[_vinculo_saida(v, c) for v in _vinculos(db, p.id)]
                )
            )
    return InstituicaoSaida(
        id=inst.id,
        nome=inst.nome,
        meu_papel=m.papel,
        membros=[
            MembroSaida(
                cuidador_id=x.cuidador_id,
                nome=x.cuidador.nome_completo,
                email=x.cuidador.usuario.email,
                papel=x.papel,
                voce=x.cuidador_id == c.id,
            )
            for x in membros
        ],
        pessoas=pessoas,
    )


@router.post("/instituicao/convites", response_model=ConviteSaida, status_code=201)
def convidar_para_instituicao(
    dados: ConviteInstituicaoEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> ConviteSaida:
    m = _exigir_gestor(c)
    return _emitir_convite(db, c, dados.papel, instituicao_id=m.instituicao_id)


@router.delete("/instituicao/membros/{cuidador_id}", status_code=204)
def remover_membro(
    cuidador_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> None:
    """O gestor remove alguém da equipe; qualquer membro pode sair.

    Quem sai perde o acesso às pessoas da instituição.
    """
    m = _membro(c) if cuidador_id == c.id else _exigir_gestor(c)
    alvo = db.scalar(
        select(MembroInstituicao).where(
            MembroInstituicao.cuidador_id == cuidador_id, MembroInstituicao.instituicao_id == m.instituicao_id
        )
    )
    if alvo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Membro não encontrado.")
    gestores = [x for x in alvo.instituicao.membros if x.papel == "gestor"]
    if alvo.papel == "gestor" and len(gestores) == 1:
        raise HTTPException(status.HTTP_409_CONFLICT, "A instituição precisa de pelo menos um gestor.")
    remover_acesso_institucional(db, alvo)
    db.commit()


def remover_acesso_institucional(db: Session, membro: MembroInstituicao) -> None:
    """Apaga os vínculos do membro com pessoas da instituição e a própria participação."""
    ids = [p.id for p in membro.instituicao.pacientes]
    if ids:
        for v in db.scalars(
            select(CuidadorPaciente).where(
                CuidadorPaciente.cuidador_id == membro.cuidador_id, CuidadorPaciente.paciente_id.in_(ids)
            )
        ):
            db.delete(v)
    db.delete(membro)


def instituicao_do_usuario(c: Cuidador) -> dict | None:
    m = c.membro
    if m is None:
        return None
    return {"id": m.instituicao_id, "nome": m.instituicao.nome, "papel": m.papel}


def _aware(d: datetime) -> datetime:
    return d if d.tzinfo else d.replace(tzinfo=UTC)


__all__ = ["router", "criar_instituicao", "instituicao_do_usuario", "gestor_de", "remover_acesso_institucional"]
