"""Modelo de dados.

Segue o modelo do TCC (cuidador, paciente, vínculo, sessão, evento), sem a
dependência do Supabase Auth: a identidade fica na tabela `usuario`.
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base, JsonType


def agora() -> datetime:
    return datetime.now(UTC)


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    cuidador: Mapped[Cuidador] = relationship(back_populates="usuario", uselist=False, cascade="all, delete-orphan")


class Cuidador(Base):
    __tablename__ = "cuidador"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("usuario.id", ondelete="CASCADE"), primary_key=True)
    nome_completo: Mapped[str] = mapped_column(String(120))
    telefone: Mapped[str | None] = mapped_column(String(20))
    tipo_vinculo: Mapped[str | None] = mapped_column(String(40))
    nome_instituicao: Mapped[str | None] = mapped_column(String(120))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    usuario: Mapped[Usuario] = relationship(back_populates="cuidador")
    vinculos: Mapped[list[CuidadorPaciente]] = relationship(back_populates="cuidador", cascade="all, delete-orphan")
    membro: Mapped[MembroInstituicao | None] = relationship(
        back_populates="cuidador", uselist=False, cascade="all, delete-orphan"
    )


# Papéis no acompanhamento de uma pessoa (vínculo cuidador–pessoa):
#   responsavel: edita o cadastro, arquiva, convida e remove cuidadores, joga e vê tudo
#   cuidador: joga, registra observações e vê tudo; não edita o cadastro nem convida
#   acompanhante: só visualiza perfil, relatórios e análises
PAPEIS_VINCULO = ("responsavel", "cuidador", "acompanhante")
# Papéis numa instituição: gestor vê e administra todas as pessoas e a equipe;
# profissional vê apenas as pessoas a que foi atribuído.
PAPEIS_INSTITUICAO = ("gestor", "profissional")


class Instituicao(Base):
    """Instituição de cuidado (ex.: casa de repouso) com equipe e pessoas acompanhadas."""

    __tablename__ = "instituicao"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String(120))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    membros: Mapped[list[MembroInstituicao]] = relationship(back_populates="instituicao", cascade="all, delete-orphan")
    pacientes: Mapped[list[Paciente]] = relationship(back_populates="instituicao")


class MembroInstituicao(Base):
    """Cada cuidador pertence a no máximo uma instituição."""

    __tablename__ = "membro_instituicao"
    __table_args__ = (CheckConstraint("papel IN ('gestor', 'profissional')", name="ck_membro_papel"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    instituicao_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("instituicao.id", ondelete="CASCADE"), index=True
    )
    cuidador_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("cuidador.id", ondelete="CASCADE"), unique=True, index=True
    )
    papel: Mapped[str] = mapped_column(String(20))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    instituicao: Mapped[Instituicao] = relationship(back_populates="membros")
    cuidador: Mapped[Cuidador] = relationship(back_populates="membro")


class Paciente(Base):
    __tablename__ = "paciente"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nome_completo: Mapped[str] = mapped_column(String(120))
    data_nascimento: Mapped[date | None] = mapped_column(Date)
    condicao: Mapped[str | None] = mapped_column(String(80))
    nivel_tecnologia: Mapped[str | None] = mapped_column(String(20))
    observacoes: Mapped[str | None] = mapped_column(Text)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    instituicao_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("instituicao.id", ondelete="SET NULL"), index=True
    )

    instituicao: Mapped[Instituicao | None] = relationship(back_populates="pacientes")
    vinculos: Mapped[list[CuidadorPaciente]] = relationship(back_populates="paciente", cascade="all, delete-orphan")
    sessoes: Mapped[list[Sessao]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", order_by="Sessao.iniciada_em"
    )


class CuidadorPaciente(Base):
    """Vínculo N:N: mais de um cuidador pode acompanhar a mesma pessoa (DEC-004)."""

    __tablename__ = "cuidador_paciente"
    __table_args__ = (
        UniqueConstraint("cuidador_id", "paciente_id", name="uk_vinculo"),
        CheckConstraint("papel IN ('responsavel', 'cuidador', 'acompanhante')", name="ck_vinculo_papel"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    cuidador_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("cuidador.id", ondelete="CASCADE"), index=True)
    paciente_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("paciente.id", ondelete="CASCADE"), index=True)
    papel: Mapped[str] = mapped_column(String(20), default="responsavel")
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    cuidador: Mapped[Cuidador] = relationship(back_populates="vinculos")
    paciente: Mapped[Paciente] = relationship(back_populates="vinculos")


class Sessao(Base):
    __tablename__ = "sessao"
    __table_args__ = (
        CheckConstraint("pontuacao IS NULL OR (pontuacao >= 0 AND pontuacao <= 100)", name="ck_sessao_pontuacao"),
        CheckConstraint("nivel BETWEEN 1 AND 3", name="ck_sessao_nivel"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    paciente_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("paciente.id", ondelete="CASCADE"), index=True)
    cuidador_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("cuidador.id", ondelete="SET NULL"))
    jogo: Mapped[str] = mapped_column(String(40), index=True)
    nivel: Mapped[int] = mapped_column(Integer)
    iniciada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    finalizada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duracao_ms: Mapped[int] = mapped_column(Integer)
    pontuacao: Mapped[float | None] = mapped_column(Float)
    metricas: Mapped[dict] = mapped_column(JsonType, default=dict)
    versao_pontuacao: Mapped[str] = mapped_column(String(20))
    contexto: Mapped[dict] = mapped_column(JsonType, default=dict)
    observacoes: Mapped[str | None] = mapped_column(Text)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)

    paciente: Mapped[Paciente] = relationship(back_populates="sessoes")
    eventos: Mapped[list[SessaoEvento]] = relationship(
        back_populates="sessao", cascade="all, delete-orphan", order_by="SessaoEvento.ordem"
    )


class SessaoEvento(Base):
    """Evento bruto de cada sessão: base para recalcular as métricas."""

    __tablename__ = "sessao_evento"
    __table_args__ = (UniqueConstraint("sessao_id", "ordem", name="uk_sessao_evento_ordem"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sessao_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("sessao.id", ondelete="CASCADE"), index=True)
    ordem: Mapped[int] = mapped_column(Integer)
    t_ms: Mapped[float] = mapped_column(Float)
    tipo: Mapped[str] = mapped_column(String(30))
    alvo: Mapped[str | None] = mapped_column(String(80))
    correto: Mapped[bool | None] = mapped_column(Boolean)
    reacao_ms: Mapped[float | None] = mapped_column(Float)
    dados: Mapped[dict] = mapped_column(JsonType, default=dict)

    sessao: Mapped[Sessao] = relationship(back_populates="eventos")


class RefreshToken(Base):
    __tablename__ = "refresh_token"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("usuario.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revogado: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class TokenRedefinicao(Base):
    __tablename__ = "token_redefinicao"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("usuario.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    usado: Mapped[bool] = mapped_column(Boolean, default=False)


class Convite(Base):
    """Código de convite de uso único: para acompanhar uma pessoa ou para entrar numa instituição."""

    __tablename__ = "convite"
    __table_args__ = (CheckConstraint("(paciente_id IS NULL) <> (instituicao_id IS NULL)", name="ck_convite_alvo"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo_hash: Mapped[str] = mapped_column(String(64), unique=True)
    paciente_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("paciente.id", ondelete="CASCADE"))
    instituicao_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("instituicao.id", ondelete="CASCADE"))
    papel: Mapped[str] = mapped_column(String(20))
    criado_por: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("cuidador.id", ondelete="SET NULL"))
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    usado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    usado_por: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("cuidador.id", ondelete="SET NULL"))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class Consentimento(Base):
    """Registro do aceite do termo (LGPD, art. 11): quem, qual versão e quando."""

    __tablename__ = "consentimento"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("usuario.id", ondelete="CASCADE"), index=True)
    finalidade: Mapped[str] = mapped_column(String(60))
    versao_termo: Mapped[str] = mapped_column(String(20))
    aceito_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class LogAcesso(Base):
    """Trilha de auditoria de operações sobre dados de pacientes (LGPD, art. 37)."""

    __tablename__ = "log_acesso"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("usuario.id", ondelete="SET NULL"))
    paciente_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("paciente.id", ondelete="SET NULL"))
    acao: Mapped[str] = mapped_column(String(30))
    ocorrido_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
