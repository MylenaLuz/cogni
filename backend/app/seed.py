"""Dados de demonstração sintéticos.

Cria uma conta de cuidador e três pessoas fictícias com meses de sessões geradas
pelo mesmo modelo da coorte sintética do TCC: uma estável, uma em melhora e uma
com declínio sustentado. Nenhum dado de pessoa real.

Uso:  python -m app.seed
"""

from __future__ import annotations

import random
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import select

from . import db
from .models import Consentimento, Cuidador, CuidadorPaciente, Paciente, Sessao, SessaoEvento, Usuario
from .security import gerar_hash
from .services import pontuacao

EMAIL = "demo@cogni.app"
SENHA = "cuidar-com-dados"

PESSOAS = [
    {
        "nome": "Maria Silva",
        "nasc": date(1948, 5, 12),
        "cond": "Alzheimer leve",
        "perfil": "estavel",
        "obs": "Maior engajamento com jogos visuais. As manhãs são o melhor horário.",
    },
    {
        "nome": "José Pereira",
        "nasc": date(1961, 2, 3),
        "cond": "Comprometimento cognitivo leve",
        "perfil": "melhora",
        "obs": "Gosta das categorias de animais.",
    },
    {
        "nome": "Antônio Lima",
        "nasc": date(1954, 9, 21),
        "cond": "Demência vascular",
        "perfil": "declinio",
        "obs": "Prefere sessões curtas, depois do almoço.",
    },
]


def _eventos_atencao(rng: random.Random, base_ms: float, sigma: float, n: int = 12) -> list[dict]:
    ev, t = [], 0.0
    for _ in range(n):
        alvo = str(rng.randrange(9))
        ev.append({"t": t, "tipo": "estimulo", "alvo": alvo})
        if rng.random() < 0.05:
            t += 2800
            ev.append({"t": t, "tipo": "omissao", "alvo": alvo})
            continue
        rt = max(250.0, rng.gauss(base_ms, sigma))
        t += rt
        ev.append({"t": t, "tipo": "toque", "alvo": alvo, "correto": True, "reacao_ms": round(rt, 1)})
        if rng.random() < 0.06:
            t += 300
            ev.append({"t": t, "tipo": "toque", "alvo": str((int(alvo) + 1) % 9), "correto": False})
        t += 250
    return ev


def _eventos_pares(rng: random.Random, habilidade: float, pares: int = 5) -> list[dict]:
    ev, t, achados = [], 0.0, 0
    while achados < pares:
        t += rng.uniform(1500, 3500)
        ok = rng.random() < habilidade
        cartas = [rng.randrange(pares * 2), rng.randrange(pares * 2)]
        ev.append({"t": t, "tipo": "tentativa", "correto": ok, "dados": {"cartas": cartas}})
        achados += ok
    return ev


def _eventos_categorias(rng: random.Random, acerto: float, corretas: int = 5, distratores: int = 4) -> list[dict]:
    ev, t = [], 0.0
    for i in range(corretas):
        if rng.random() < acerto:
            t += rng.uniform(1200, 2600)
            ev.append({"t": t, "tipo": "toque", "alvo": f"c{i}", "correto": True})
    for i in range(distratores):
        if rng.random() < (1 - acerto) * 0.5:
            t += rng.uniform(800, 1600)
            ev.append({"t": t, "tipo": "toque", "alvo": f"d{i}", "correto": False})
    return ev


def _eventos_imagens(rng: random.Random, habilidade: float, pares: int = 4) -> list[dict]:
    ev, t, achados = [], 0.0, 0
    while achados < pares:
        rt = rng.uniform(1500, 3200)
        t += rt
        ok = rng.random() < habilidade
        ev.append({"t": t, "tipo": "tentativa", "alvo": str(achados), "correto": ok, "reacao_ms": round(rt, 1)})
        achados += ok
    return ev


def _gerar(rng: random.Random, perfil: str, semanas: int = 22):
    hoje = datetime.now(UTC).replace(hour=10, minute=0, second=0, microsecond=0)
    inicio = hoje - timedelta(weeks=semanas)
    base = rng.uniform(800, 950)
    sigma = base * 0.07
    habilidade = rng.uniform(0.45, 0.6)
    sessoes = []
    n = 0
    for semana in range(semanas):
        for dia in (1, 4):
            quando = inicio + timedelta(weeks=semana, days=dia, minutes=rng.randrange(-60, 60))
            if quando > hoje:
                continue
            aprendizado = 0.25 * base * pow(2.718, -n / 3)
            ajuste = 0.0
            if perfil == "declinio" and semana >= semanas - 9:
                ajuste = 0.12 * sigma * (semana - (semanas - 9) + 1) * 2
            if perfil == "melhora" and semana >= semanas - 10:
                ajuste = -0.10 * sigma * (semana - (semanas - 10) + 1) * 2
            tr = base + aprendizado + ajuste
            sessoes.append(("atencao", 1 if n < 8 else 2, quando, _eventos_atencao(rng, tr, sigma), {}))
            if n % 2 == 0:
                hab = habilidade - (0.012 * max(0, semana - (semanas - 9)) if perfil == "declinio" else 0)
                sessoes.append(("pares", 2, quando + timedelta(minutes=12), _eventos_pares(rng, hab), {}))
                sessoes.append(
                    (
                        "categorias",
                        2,
                        quando + timedelta(minutes=20),
                        _eventos_categorias(rng, 0.85),
                        {"total_corretas": 5},
                    )
                )
            else:
                sessoes.append(("imagens", 2, quando + timedelta(minutes=12), _eventos_imagens(rng, 0.8), {"pares": 4}))
            n += 1
    return sessoes


def popular() -> None:
    db.configurar()
    sessao = next(db.get_db())
    try:
        existente = sessao.scalar(select(Usuario).where(Usuario.email == EMAIL))
        if existente:
            for v in existente.cuidador.vinculos:
                sessao.delete(v.paciente)
            sessao.delete(existente)
            sessao.commit()

        usuario = Usuario(email=EMAIL, senha_hash=gerar_hash(SENHA))
        cuidador = Cuidador(
            usuario=usuario, nome_completo="Beatriz Souza", tipo_vinculo="Filho(a)", telefone="41999990000"
        )
        sessao.add_all([usuario, cuidador])
        sessao.flush()
        sessao.add(Consentimento(usuario_id=usuario.id, finalidade="uso_do_servico", versao_termo="2026-11"))

        rng = random.Random(20261123)
        for pessoa in PESSOAS:
            p = Paciente(
                nome_completo=pessoa["nome"],
                data_nascimento=pessoa["nasc"],
                condicao=pessoa["cond"],
                observacoes=pessoa["obs"],
            )
            sessao.add(p)
            sessao.flush()
            sessao.add(CuidadorPaciente(cuidador_id=cuidador.id, paciente_id=p.id))
            for jogo, nivel, quando, eventos, contexto in _gerar(rng, pessoa["perfil"]):
                objs = [pontuacao.Evento(**e) for e in eventos]
                nota, metricas = pontuacao.calcular(jogo, objs, contexto)
                fim = quando + timedelta(milliseconds=max(e["t"] for e in eventos) + 500)
                s = Sessao(
                    paciente_id=p.id,
                    cuidador_id=cuidador.id,
                    jogo=jogo,
                    nivel=nivel,
                    iniciada_em=quando,
                    finalizada_em=fim,
                    duracao_ms=int((fim - quando).total_seconds() * 1000),
                    pontuacao=nota,
                    metricas=metricas,
                    versao_pontuacao=pontuacao.VERSAO,
                    contexto=contexto,
                )
                s.eventos = [
                    SessaoEvento(
                        ordem=i,
                        t_ms=e["t"],
                        tipo=e["tipo"],
                        alvo=e.get("alvo"),
                        correto=e.get("correto"),
                        reacao_ms=e.get("reacao_ms"),
                        dados=e.get("dados") or {},
                    )
                    for i, e in enumerate(eventos)
                ]
                sessao.add(s)
        sessao.commit()
        print(f"Demonstração criada. Entre com {EMAIL} / {SENHA}")
    finally:
        sessao.close()


if __name__ == "__main__":
    popular()
