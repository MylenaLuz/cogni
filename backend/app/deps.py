"""Dependências compartilhadas: usuário autenticado e acesso a pacientes por vínculo."""

import uuid

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import Cuidador, CuidadorPaciente, LogAcesso, Paciente
from .security import ler_access_token


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


def carregar_paciente(db: Session, cuidador: Cuidador, paciente_id: uuid.UUID, acao: str = "consulta") -> Paciente:
    """Só devolve o paciente se houver vínculo ativo (substitui o RLS do Supabase).

    Sem vínculo, responde 404, e não 403, para não revelar que o registro existe.
    """
    paciente = db.scalar(
        select(Paciente)
        .join(CuidadorPaciente, CuidadorPaciente.paciente_id == Paciente.id)
        .where(
            Paciente.id == paciente_id,
            Paciente.ativo.is_(True),
            CuidadorPaciente.cuidador_id == cuidador.id,
            CuidadorPaciente.ativo.is_(True),
        )
    )
    if paciente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pessoa não encontrada.")
    db.add(LogAcesso(usuario_id=cuidador.id, paciente_id=paciente.id, acao=acao))
    return paciente


def pacientes_do_cuidador(db: Session, cuidador: Cuidador) -> list[Paciente]:
    return list(
        db.scalars(
            select(Paciente)
            .join(CuidadorPaciente, CuidadorPaciente.paciente_id == Paciente.id)
            .where(
                CuidadorPaciente.cuidador_id == cuidador.id,
                CuidadorPaciente.ativo.is_(True),
                Paciente.ativo.is_(True),
            )
            .order_by(Paciente.nome_completo)
        )
    )
