"""Contratos de entrada e saída da API."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Jogo = Literal["atencao", "pares", "categorias", "imagens"]


class IdosoEntrada(BaseModel):
    nome_completo: str = Field(min_length=2, max_length=120)
    data_nascimento: date | None = None
    condicao: str | None = Field(default=None, max_length=80)
    nivel_tecnologia: str | None = Field(default=None, max_length=20)
    observacoes: str | None = Field(default=None, max_length=2000)


class CadastroEntrada(BaseModel):
    nome_completo: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str
    telefone: str | None = Field(default=None, max_length=20)
    tipo_vinculo: str | None = Field(default=None, max_length=40)
    nome_instituicao: str | None = Field(default=None, max_length=120)
    aceite_termo: bool
    versao_termo: str = "2026-11"
    idoso: IdosoEntrada | None = None


class LoginEntrada(BaseModel):
    email: EmailStr
    senha: str


class EsqueciEntrada(BaseModel):
    email: EmailStr


class RedefinirEntrada(BaseModel):
    token: str
    nova_senha: str


class UsuarioSaida(BaseModel):
    id: uuid.UUID
    email: str
    nome_completo: str
    telefone: str | None
    tipo_vinculo: str | None
    nome_instituicao: str | None


class TokenSaida(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioSaida


class PacienteAtualizar(BaseModel):
    nome_completo: str | None = Field(default=None, min_length=2, max_length=120)
    data_nascimento: date | None = None
    condicao: str | None = Field(default=None, max_length=80)
    nivel_tecnologia: str | None = Field(default=None, max_length=20)
    observacoes: str | None = Field(default=None, max_length=2000)


class AnaliseJogoSaida(BaseModel):
    jogo: str
    estado: str
    sessoes: int
    faltam: int


class PacienteResumo(BaseModel):
    id: uuid.UUID
    nome_completo: str
    idade: int | None
    condicao: str | None
    observacoes: str | None
    total_sessoes: int
    ultima_sessao: datetime | None
    indice: float | None
    tendencia: str
    estado: str
    alerta: str | None
    dominios: dict[str, float | None]
    historico: list[dict]
    por_jogo: list[AnaliseJogoSaida]


class EventoEntrada(BaseModel):
    t: float = Field(ge=0)
    tipo: str = Field(max_length=30)
    alvo: str | None = Field(default=None, max_length=80)
    correto: bool | None = None
    reacao_ms: float | None = Field(default=None, ge=0)
    dados: dict | None = None


class SessaoEntrada(BaseModel):
    jogo: Jogo
    nivel: int = Field(ge=1, le=3)
    iniciada_em: datetime
    finalizada_em: datetime
    eventos: list[EventoEntrada] = Field(max_length=5000)
    contexto: dict | None = None
    observacoes: str | None = Field(default=None, max_length=2000)


class SessaoSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    paciente_id: uuid.UUID
    jogo: str
    nivel: int
    iniciada_em: datetime
    finalizada_em: datetime
    duracao_ms: int
    pontuacao: float | None
    metricas: dict
    versao_pontuacao: str
    observacoes: str | None


class SessaoRecente(SessaoSaida):
    paciente_nome: str


class Insight(BaseModel):
    paciente_id: uuid.UUID
    paciente_nome: str
    tipo: str
    titulo: str
    mensagem: str
    jogo: str | None


class Painel(BaseModel):
    nome_cuidador: str
    total_pacientes: int
    sessoes_hoje: int
    alertas: int
    pacientes: list[PacienteResumo]
    sessoes_recentes: list[SessaoRecente]
