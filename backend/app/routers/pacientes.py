"""Pessoas acompanhadas, sessões de jogos, painel e insights."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import (
    PODE_GERENCIAR,
    PODE_JOGAR,
    carregar_paciente,
    cuidador_atual,
    gestor_de,
    pacientes_do_cuidador,
    papel_sobre,
)
from ..models import Cuidador, CuidadorPaciente, Paciente, Sessao, SessaoEvento
from ..schemas import (
    AnaliseJogoSaida,
    IdosoEntrada,
    Insight,
    PacienteAtualizar,
    PacienteResumo,
    Painel,
    SessaoEntrada,
    SessaoRecente,
    SessaoSaida,
)
from ..services import motor, pontuacao

router = APIRouter(tags=["pacientes"])


def _idade(nasc: date | None) -> int | None:
    if not nasc:
        return None
    hoje = date.today()
    return hoje.year - nasc.year - ((hoje.month, hoje.day) < (nasc.month, nasc.day))


def _pontos(p: Paciente) -> list[motor.Ponto]:
    return [motor.Ponto(s.iniciada_em, s.jogo, s.pontuacao, s.metricas or {}) for s in p.sessoes]


def resumo(p: Paciente, papel: str) -> PacienteResumo:
    analise = motor.analisar_paciente(_pontos(p))
    insights = motor.textos_insight(p.nome_completo, analise)
    alerta = next((i["mensagem"] for i in insights if i["tipo"] == "alerta"), None)
    ultima = max((s.iniciada_em for s in p.sessoes), default=None)
    return PacienteResumo(
        id=p.id,
        nome_completo=p.nome_completo,
        idade=_idade(p.data_nascimento),
        condicao=p.condicao,
        observacoes=p.observacoes,
        total_sessoes=len(p.sessoes),
        ultima_sessao=ultima,
        indice=analise.indice,
        tendencia=analise.tendencia,
        estado=analise.estado,
        alerta=alerta,
        dominios=analise.dominios,
        historico=analise.historico,
        por_jogo=[
            AnaliseJogoSaida(jogo=a.jogo, estado=a.estado, sessoes=a.sessoes, faltam=a.faltam) for a in analise.por_jogo
        ],
        meu_papel=papel,
        instituicao=p.instituicao.nome if p.instituicao else None,
        nivel_tecnologia=p.nivel_tecnologia,
        data_nascimento=p.data_nascimento,
    )


def _resumos(db: Session, c: Cuidador, pacientes: list[Paciente]) -> list[PacienteResumo]:
    return [resumo(p, papel_sobre(db, c, p) or "acompanhante") for p in pacientes]


@router.get("/pacientes", response_model=list[PacienteResumo])
def listar(db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> list[PacienteResumo]:
    return _resumos(db, c, pacientes_do_cuidador(db, c))


@router.post("/pacientes", response_model=PacienteResumo, status_code=201)
def criar(dados: IdosoEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> PacienteResumo:
    # cadastrada por um gestor, a pessoa passa a pertencer à instituição
    p = Paciente(**dados.model_dump(), instituicao_id=gestor_de(c))
    db.add(p)
    db.flush()
    db.add(CuidadorPaciente(cuidador_id=c.id, paciente_id=p.id, papel="responsavel"))
    db.commit()
    db.refresh(p)
    return resumo(p, papel_sobre(db, c, p))


@router.get("/pacientes/{paciente_id}", response_model=PacienteResumo)
def detalhar(paciente_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)):
    p = carregar_paciente(db, c, paciente_id)
    db.commit()
    return resumo(p, papel_sobre(db, c, p))


@router.patch("/pacientes/{paciente_id}", response_model=PacienteResumo)
def atualizar(
    paciente_id: uuid.UUID,
    dados: PacienteAtualizar,
    db: Session = Depends(get_db),
    c: Cuidador = Depends(cuidador_atual),
) -> PacienteResumo:
    p = carregar_paciente(db, c, paciente_id, acao="alteracao", exigir=PODE_GERENCIAR)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(p, campo, valor)
    db.commit()
    return resumo(p, papel_sobre(db, c, p))


@router.delete("/pacientes/{paciente_id}", status_code=204)
def arquivar(paciente_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> None:
    p = carregar_paciente(db, c, paciente_id, acao="exclusao", exigir=PODE_GERENCIAR)
    p.ativo = False
    db.commit()


@router.get("/pacientes/{paciente_id}/sessoes", response_model=list[SessaoSaida])
def listar_sessoes(paciente_id: uuid.UUID, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)):
    p = carregar_paciente(db, c, paciente_id)
    db.commit()
    return sorted(p.sessoes, key=lambda s: s.iniciada_em, reverse=True)


@router.post("/pacientes/{paciente_id}/sessoes", response_model=SessaoSaida, status_code=201)
def registrar_sessao(
    paciente_id: uuid.UUID, dados: SessaoEntrada, db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)
) -> Sessao:
    p = carregar_paciente(db, c, paciente_id, acao="insercao", exigir=PODE_JOGAR)
    if dados.finalizada_em < dados.iniciada_em:
        raise HTTPException(422, "A sessão termina antes de começar.")
    eventos = [pontuacao.Evento(**e.model_dump()) for e in dados.eventos]
    nota, metricas = pontuacao.calcular(dados.jogo, eventos, dados.contexto)
    s = Sessao(
        paciente_id=p.id,
        cuidador_id=c.id,
        jogo=dados.jogo,
        nivel=dados.nivel,
        iniciada_em=dados.iniciada_em,
        finalizada_em=dados.finalizada_em,
        duracao_ms=int((dados.finalizada_em - dados.iniciada_em).total_seconds() * 1000),
        pontuacao=nota,
        metricas=metricas,
        versao_pontuacao=pontuacao.VERSAO,
        contexto=dados.contexto or {},
        observacoes=dados.observacoes,
    )
    s.eventos = [
        SessaoEvento(
            ordem=i, t_ms=e.t, tipo=e.tipo, alvo=e.alvo, correto=e.correto, reacao_ms=e.reacao_ms, dados=e.dados or {}
        )
        for i, e in enumerate(dados.eventos)
    ]
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def _recentes(db: Session, pacientes: list[Paciente], limite: int = 10) -> list[SessaoRecente]:
    ids = [p.id for p in pacientes]
    nomes = {p.id: p.nome_completo for p in pacientes}
    if not ids:
        return []
    sessoes = db.scalars(
        select(Sessao).where(Sessao.paciente_id.in_(ids)).order_by(Sessao.iniciada_em.desc()).limit(limite)
    )
    return [
        SessaoRecente(**SessaoSaida.model_validate(s).model_dump(), paciente_nome=nomes[s.paciente_id]) for s in sessoes
    ]


@router.get("/painel", response_model=Painel)
def painel(db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> Painel:
    pacientes = pacientes_do_cuidador(db, c)
    resumos = _resumos(db, c, pacientes)
    hoje = datetime.now(UTC).date()
    sessoes_hoje = sum(1 for p in pacientes for s in p.sessoes if _aware(s.iniciada_em).date() == hoje)
    return Painel(
        nome_cuidador=c.nome_completo,
        total_pacientes=len(pacientes),
        sessoes_hoje=sessoes_hoje,
        alertas=sum(1 for r in resumos if r.alerta),
        pacientes=resumos,
        sessoes_recentes=_recentes(db, pacientes),
    )


@router.get("/insights", response_model=list[Insight])
def insights(db: Session = Depends(get_db), c: Cuidador = Depends(cuidador_atual)) -> list[Insight]:
    saida: list[Insight] = []
    for p in pacientes_do_cuidador(db, c):
        analise = motor.analisar_paciente(_pontos(p))
        for i in motor.textos_insight(p.nome_completo, analise):
            saida.append(Insight(paciente_id=p.id, paciente_nome=p.nome_completo, **i))
    ordem = {"alerta": 0, "melhora": 1, "recomendacao": 2, "tendencia": 3}
    return sorted(saida, key=lambda i: ordem.get(i.tipo, 9))


def _aware(d: datetime) -> datetime:
    return d if d.tzinfo else d.replace(tzinfo=UTC)
