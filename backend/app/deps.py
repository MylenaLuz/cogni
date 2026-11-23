"""Dependências compartilhadas: usuário autenticado e acesso a pessoas por papel.

Quem pode o quê sobre uma pessoa acompanhada:

| papel        | ver | jogar e observar | editar, arquivar, convidar, gerenciar cuidadores |
|--------------|-----|------------------|--------------------------------------------------|
| responsavel  | sim | sim              | sim                                              |
| cuidador     | sim | sim              | não                                              |
| acompanhante | sim | não              | não                                              |
| gestor*      | sim | sim              | sim                                              |

* gestor da instituição a que a pessoa pertence, mesmo sem vínculo direto.
"""

import uuid

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import Cuidador, CuidadorPaciente, LogAcesso, Paciente
from .security import ler_access_token

PODE_JOGAR = frozenset({"responsavel", "cuidador", "gestor"})
PODE_GERENCIAR = frozenset({"responsavel", "gestor"})


def cuidador_atual(request: Request, db: Session = Depends(get_db)) -> Cuidador:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Não autenticado.")
    usuario_id = ler_access_token(auth[7:].strip())
    if usuario_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão expirada. Entre novamente.")
    cuidador = db.get(Cuidador, usuario_id)
    if cuidador is None or not cuidador.usuario.ativo:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Não autenticado.")
    return cuidador


def gestor_de(cuidador: Cuidador) -> uuid.UUID | None:
    """Id da instituição de que o cuidador é gestor, se for."""
    m = cuidador.membro
    return m.instituicao_id if m is not None and m.papel == "gestor" else None


def papel_sobre(db: Session, cuidador: Cuidador, paciente: Paciente) -> str | None:
    """Papel efetivo do cuidador sobre a pessoa, ou None se não tiver acesso."""
    vinculo = db.scalar(
        select(CuidadorPaciente).where(
            CuidadorPaciente.cuidador_id == cuidador.id,
            CuidadorPaciente.paciente_id == paciente.id,
            CuidadorPaciente.ativo.is_(True),
        )
    )
    inst = gestor_de(cuidador)
    if inst is not None and paciente.instituicao_id == inst:
        return "gestor"
    return vinculo.papel if vinculo is not None else None


def carregar_paciente(
    db: Session,
    cuidador: Cuidador,
    paciente_id: uuid.UUID,
    acao: str = "consulta",
    exigir: frozenset[str] | None = None,
) -> Paciente:
    """Devolve a pessoa se o cuidador tiver acesso; `exigir` restringe aos papéis listados.

    Sem acesso nenhum, responde 404, e não 403, para não revelar que o registro existe.
    Com acesso, mas papel insuficiente, responde 403.
    """
    paciente = db.get(Paciente, paciente_id)
    papel = papel_sobre(db, cuidador, paciente) if paciente is not None and paciente.ativo else None
    if papel is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pessoa não encontrada.")
    if exigir is not None and papel not in exigir:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Seu papel no acompanhamento desta pessoa não permite essa ação."
        )
    db.add(LogAcesso(usuario_id=cuidador.id, paciente_id=paciente.id, acao=acao))
    return paciente


def pacientes_do_cuidador(db: Session, cuidador: Cuidador) -> list[Paciente]:
    """Pessoas com vínculo ativo e, para gestores, todas as pessoas da instituição."""
    por_vinculo = select(CuidadorPaciente.paciente_id).where(
        CuidadorPaciente.cuidador_id == cuidador.id, CuidadorPaciente.ativo.is_(True)
    )
    condicao = Paciente.id.in_(por_vinculo)
    inst = gestor_de(cuidador)
    if inst is not None:
        condicao = condicao | (Paciente.instituicao_id == inst)
    return list(db.scalars(select(Paciente).where(condicao, Paciente.ativo.is_(True)).order_by(Paciente.nome_completo)))
