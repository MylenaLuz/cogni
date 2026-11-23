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
from .models import (
    Consentimento,
    Cuidador,
    CuidadorPaciente,
    Instituicao,
    MembroInstituicao,
    Paciente,
    Sessao,
    SessaoEvento,
    Usuario,
)
from .schemas import VERSAO_TERMO
from .security import gerar_hash
from .services import pontuacao

EMAIL = "demo@cogni.app"
SENHA = "cuidar-com-dados"

# Observações fictícias nas sessões mais recentes de cada pessoa (da mais antiga para a mais nova).
NOTAS = {
    "estavel": ["Fez com tranquilidade, conversou sobre as frutas da feira.", "Animada hoje, quis jogar de novo."],
    "melhora": ["Dormiu bem; respondeu rápido e com segurança.", "Pediu para aumentar o nível na próxima vez."],
    "declinio": ["Pareceu cansado depois do almoço.", "Demorou para começar; perguntou duas vezes o que fazer."],
}

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


# Contas da demonstração (todas com a mesma senha) e o que cada uma mostra:
#   demo@cogni.app     Beatriz, filha: responsável por Maria, José e Antônio
#   carla@cogni.app    Carla, cuidadora profissional: cuidadora do Antônio, acompanhante da Maria
#                      e profissional do Residencial Bem Viver, atribuída à Helena
#   gestor@cogni.app   Lúcia, gestora do Residencial Bem Viver, com Helena e Rubens
CONTAS = {
    "demo": (EMAIL, "Beatriz Souza", "Filho(a)", "41999990000"),
    "carla": ("carla@cogni.app", "Carla Mendes", "Profissional", "41988880000"),
    "gestor": ("gestor@cogni.app", "Lúcia Ferreira", "Instituição", "4133330000"),
}
INSTITUICAO = "Residencial Bem Viver"
PESSOAS_INSTITUICAO = [
    {
        "nome": "Helena Costa",
        "nasc": date(1941, 7, 2),
        "cond": "Alzheimer moderado",
        "perfil": "estavel",
        "obs": "Gosta de música; prefere atividades pela manhã.",
    },
    {
        "nome": "Rubens Alves",
        "nasc": date(1946, 11, 18),
        "cond": "Doença de Parkinson",
        "perfil": "estavel",
        "obs": "Tremor nas mãos; usar o nível básico de atenção.",
    },
]


def _limpar(sessao) -> None:
    emails = [c[0] for c in CONTAS.values()]
    for u in sessao.scalars(select(Usuario).where(Usuario.email.in_(emails))):
        for v in list(u.cuidador.vinculos):
            sessao.delete(v.paciente)
        if u.cuidador.membro is not None:
            inst = u.cuidador.membro.instituicao
            for pac in list(inst.pacientes):
                sessao.delete(pac)
            sessao.delete(inst)
        sessao.delete(u)
    sessao.commit()


def _conta(sessao, chave: str) -> Cuidador:
    email, nome, tipo, tel = CONTAS[chave]
    usuario = Usuario(email=email, senha_hash=gerar_hash(SENHA))
    cuidador = Cuidador(usuario=usuario, nome_completo=nome, tipo_vinculo=tipo, telefone=tel)
    sessao.add_all([usuario, cuidador])
    sessao.flush()
    sessao.add(Consentimento(usuario_id=usuario.id, finalidade="uso_do_servico", versao_termo=VERSAO_TERMO))
    return cuidador


def _pessoa(sessao, rng: random.Random, pessoa: dict, quem_joga: Cuidador, instituicao_id=None) -> Paciente:
    p = Paciente(
        nome_completo=pessoa["nome"],
        data_nascimento=pessoa["nasc"],
        condicao=pessoa["cond"],
        observacoes=pessoa["obs"],
        instituicao_id=instituicao_id,
    )
    sessao.add(p)
    sessao.flush()
    geradas = _gerar(rng, pessoa["perfil"])
    notas = dict(zip(range(len(geradas) - 1, -1, -3), reversed(NOTAS[pessoa["perfil"]]), strict=False))
    for k, (jogo, nivel, quando, eventos, contexto) in enumerate(geradas):
        objs = [pontuacao.Evento(**e) for e in eventos]
        nota, metricas = pontuacao.calcular(jogo, objs, contexto)
        fim = quando + timedelta(milliseconds=max((e["t"] for e in eventos), default=0) + 500)
        s = Sessao(
            paciente_id=p.id,
            cuidador_id=quem_joga.id,
            jogo=jogo,
            nivel=nivel,
            iniciada_em=quando,
            finalizada_em=fim,
            duracao_ms=int((fim - quando).total_seconds() * 1000),
            pontuacao=nota,
            metricas=metricas,
            versao_pontuacao=pontuacao.VERSAO,
            contexto=contexto,
            observacoes=notas.get(k),
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
    return p


def popular() -> None:
    db.configurar()
    sessao = next(db.get_db())
    try:
        _limpar(sessao)
        beatriz, carla, lucia = _conta(sessao, "demo"), _conta(sessao, "carla"), _conta(sessao, "gestor")

        rng = random.Random(20261123)
        familia = {}
        for pessoa in PESSOAS:
            p = _pessoa(sessao, rng, pessoa, beatriz)
            sessao.add(CuidadorPaciente(cuidador_id=beatriz.id, paciente_id=p.id, papel="responsavel"))
            familia[pessoa["nome"]] = p
        sessao.add(CuidadorPaciente(cuidador_id=carla.id, paciente_id=familia["Antônio Lima"].id, papel="cuidador"))
        sessao.add(CuidadorPaciente(cuidador_id=carla.id, paciente_id=familia["Maria Silva"].id, papel="acompanhante"))

        inst = Instituicao(nome=INSTITUICAO)
        sessao.add(inst)
        sessao.flush()
        lucia.nome_instituicao = INSTITUICAO
        sessao.add(MembroInstituicao(instituicao_id=inst.id, cuidador_id=lucia.id, papel="gestor"))
        sessao.add(MembroInstituicao(instituicao_id=inst.id, cuidador_id=carla.id, papel="profissional"))
        for pessoa in PESSOAS_INSTITUICAO:
            p = _pessoa(sessao, rng, pessoa, lucia, instituicao_id=inst.id)
            sessao.add(CuidadorPaciente(cuidador_id=lucia.id, paciente_id=p.id, papel="responsavel"))
            if pessoa["nome"] == "Helena Costa":
                sessao.add(CuidadorPaciente(cuidador_id=carla.id, paciente_id=p.id, papel="cuidador"))
        sessao.commit()
        print(f"Demonstração criada. Senha de todas as contas: {SENHA}")
        for email, nome, _, _ in CONTAS.values():
            print(f"  {email:<20} {nome}")
    finally:
        sessao.close()


if __name__ == "__main__":
    popular()
