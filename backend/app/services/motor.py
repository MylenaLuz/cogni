"""Motor de métricas: padrão pessoal (baseline) e detecção de mudança sustentada.

Determinístico e auditável. Nenhum alerta depende de modelo de linguagem.

1. Descarta as primeiras sessões de cada jogo (efeito de aprendizado).
2. Estima o padrão pessoal com mediana e desvio absoluto mediano (MAD).
3. Calcula o escore z robusto de cada sessão, limitado a 4 (um dia ruim
   isolado não dispara nada sozinho).
4. Aplica a soma cumulativa (CUSUM, Page, 1954) nos dois sentidos: piora e melhora.

Parâmetros avaliados em coorte sintética de 3.600 pacientes (TCC, cap. 11).
A linguagem dos textos é não diagnóstica por requisito (RNF31).
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from statistics import median

from .pontuacao import DOMINIOS, JOGOS

DESCARTE = 6  # sessões iniciais de aprendizado
N_BASE = 12  # sessões usadas para estimar o padrão
K = 0.5  # desvio mínimo de interesse, em unidades robustas
H = 8.0  # limiar do alarme
Z_MAX = 4.0  # limite do escore de uma sessão
JANELA_RECENTE = 6  # alarmes nas últimas N sessões contam como "atuais"
# Pontuações de 0 a 100 assumem poucos valores (ex.: 100, 80, 67), e a MAD da linha de base
# pode sair perto de zero; um piso evita que poucas notas diferentes pareçam um desvio enorme.
MAD_MIN_PONTUACAO = 10.0
MIN_SESSOES = DESCARTE + N_BASE + 1


@dataclass
class Ponto:
    quando: datetime
    jogo: str
    pontuacao: float | None
    metricas: dict


@dataclass
class AnaliseJogo:
    jogo: str
    estado: str  # aprendendo | estavel | piora | melhora
    sessoes: int
    faltam: int = 0
    mediana: float | None = None
    mad: float | None = None
    sessoes_fora: int = 0


@dataclass
class AnalisePaciente:
    tendencia: str  # up | down | stable
    estado: str  # aprendendo | estavel | piora | melhora
    indice: float | None
    dominios: dict[str, float | None]
    historico: list[dict]
    por_jogo: list[AnaliseJogo] = field(default_factory=list)


def _valor_pior_positivo(p: Ponto) -> float | None:
    """Converte a métrica-chave do jogo para que valores maiores signifiquem piora."""
    chave = JOGOS[p.jogo]["metrica_chave"]
    if chave == "pontuacao":
        return None if p.pontuacao is None else -p.pontuacao
    v = p.metricas.get(chave)
    return None if v is None else float(v)


def analisar_jogo(jogo: str, pontos: list[Ponto]) -> AnaliseJogo:
    valores = [v for v in (_valor_pior_positivo(p) for p in pontos) if v is not None]
    if len(valores) < MIN_SESSOES:
        return AnaliseJogo(jogo, "aprendendo", len(valores), faltam=MIN_SESSOES - len(valores))

    base = valores[DESCARTE : DESCARTE + N_BASE]
    med = median(base)
    mad = median(abs(x - med) for x in base) * 1.4826
    if mad < 1e-6:
        mad = max(abs(med) * 0.05, 1.0)
    if JOGOS[jogo]["metrica_chave"] == "pontuacao":
        mad = max(mad, MAD_MIN_PONTUACAO)

    s_piora = s_melhora = 0.0
    ultimo_piora = ultimo_melhora = -(10**9)
    fora = 0
    resto = valores[DESCARTE + N_BASE :]
    for i, x in enumerate(resto):
        z = max(-Z_MAX, min(Z_MAX, (x - med) / mad))
        if abs(z) > 2:
            fora += 1
        s_piora = max(0.0, s_piora + z - K)
        s_melhora = max(0.0, s_melhora - z - K)
        if s_piora > H:
            ultimo_piora, s_piora = i, 0.0
        if s_melhora > H:
            ultimo_melhora, s_melhora = i, 0.0

    n = len(resto)
    if n - 1 - ultimo_piora < JANELA_RECENTE:
        estado = "piora"
    elif n - 1 - ultimo_melhora < JANELA_RECENTE:
        estado = "melhora"
    else:
        estado = "estavel"
    fora_recentes = sum(1 for x in resto[-JANELA_RECENTE:] if (x - med) / mad > 2)
    return AnaliseJogo(jogo, estado, len(valores), mediana=med, mad=mad, sessoes_fora=fora_recentes)


def analisar_paciente(pontos: list[Ponto], hoje: datetime | None = None) -> AnalisePaciente:
    hoje = hoje or datetime.now(UTC)
    por_jogo: dict[str, list[Ponto]] = defaultdict(list)
    for p in sorted(pontos, key=lambda p: p.quando):
        por_jogo[p.jogo].append(p)
    analises = [analisar_jogo(j, ps) for j, ps in por_jogo.items() if j in JOGOS]

    if any(a.estado == "piora" for a in analises):
        estado, tendencia = "piora", "down"
    elif any(a.estado == "melhora" for a in analises):
        estado, tendencia = "melhora", "up"
    elif analises and all(a.estado == "aprendendo" for a in analises):
        estado, tendencia = "aprendendo", "stable"
    else:
        estado, tendencia = "estavel", "stable"

    com_pontuacao = [p for p in sorted(pontos, key=lambda p: p.quando) if p.pontuacao is not None]
    recentes = com_pontuacao[-8:]
    indice = round(sum(p.pontuacao for p in recentes) / len(recentes), 1) if recentes else None

    # domínios: média ponderada das pontuações das últimas 10 sessões de cada jogo
    soma = dict.fromkeys(DOMINIOS, 0.0)
    peso = dict.fromkeys(DOMINIOS, 0.0)
    for jogo, ps in por_jogo.items():
        ult = [p.pontuacao for p in ps[-10:] if p.pontuacao is not None]
        if not ult or jogo not in JOGOS:
            continue
        media = sum(ult) / len(ult)
        for dom, w in JOGOS[jogo]["dominios"].items():
            soma[dom] += media * w
            peso[dom] += w
    dominios = {d: (round(soma[d] / peso[d], 1) if peso[d] else None) for d in DOMINIOS}

    # histórico semanal das últimas 8 semanas
    inicio_semana = (hoje - timedelta(days=hoje.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    historico = []
    for k in range(7, -1, -1):
        ini = inicio_semana - timedelta(weeks=k)
        fim = ini + timedelta(weeks=1)
        vals = [p.pontuacao for p in com_pontuacao if ini <= _aware(p.quando) < fim]
        historico.append(
            {
                "semana": ini.date().isoformat(),
                "media": round(sum(vals) / len(vals), 1) if vals else None,
                "sessoes": len(vals),
            }
        )

    return AnalisePaciente(tendencia, estado, indice, dominios, historico, analises)


def _aware(d: datetime) -> datetime:
    return d if d.tzinfo else d.replace(tzinfo=UTC)


def primeiro_nome(nome: str) -> str:
    return nome.split()[0] if nome else "a pessoa"


def textos_insight(nome: str, analise: AnalisePaciente) -> list[dict]:
    """Textos para o cuidador. Descrevem o observado, nunca diagnosticam."""
    pn = primeiro_nome(nome)
    saida = []
    for a in analise.por_jogo:
        jogo = JOGOS[a.jogo]["nome"]
        if a.estado == "piora":
            medida = "o tempo de resposta" if a.jogo == "atencao" else "o desempenho"
            sentido = "acima" if a.jogo == "atencao" else "abaixo"
            saida.append(
                {
                    "tipo": "alerta",
                    "titulo": f"Mudança sustentada em {jogo}",
                    "mensagem": (
                        f"Nas últimas sessões, {medida} de {pn} em {jogo} ficou {sentido} da faixa habitual "
                        f"de forma consistente, e não apenas em um dia. Se você também percebeu mudanças "
                        f"no dia a dia, pode ser um bom momento para conversar com o profissional de saúde "
                        f"que acompanha {pn}."
                    ),
                    "jogo": a.jogo,
                }
            )
        elif a.estado == "melhora":
            saida.append(
                {
                    "tipo": "melhora",
                    "titulo": f"Evolução em {jogo}",
                    "mensagem": f"{pn} vem tendo um desempenho melhor que o habitual em {jogo}. Continue a rotina.",
                    "jogo": a.jogo,
                }
            )
        elif a.estado == "aprendendo":
            saida.append(
                {
                    "tipo": "tendencia",
                    "titulo": f"Conhecendo o padrão em {jogo}",
                    "mensagem": (
                        f"O Cogni ainda está aprendendo o padrão de {pn} em {jogo}. "
                        f"Faltam {a.faltam} sessões para comparar com segurança."
                    ),
                    "jogo": a.jogo,
                }
            )
    total_semana = analise.historico[-1]["sessoes"] if analise.historico else 0
    if total_semana < 2:
        saida.append(
            {
                "tipo": "recomendacao",
                "titulo": "Frequência recomendada",
                "mensagem": (
                    (
                        f"{pn} ainda não fez sessões nesta semana. "
                        if total_semana == 0
                        else f"{pn} fez 1 sessão nesta semana. "
                    )
                    + "Duas ou mais sessões por semana ajudam o Cogni a perceber mudanças com mais segurança."
                ),
                "jogo": None,
            }
        )
    return saida
