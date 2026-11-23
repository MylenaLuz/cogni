"""Pontuação padronizada e versionada (scoring v1).

As métricas são calculadas a partir dos eventos brutos de cada sessão. A versão
fica gravada na sessão: se a fórmula mudar, o histórico pode ser recalculado a
partir dos eventos, sem perda de dados.

Contrato dos eventos (enviados pelo front-end):
    t          milissegundos desde o início da sessão (performance.now)
    tipo       estimulo | toque | omissao | virada | tentativa
    alvo       identificador do estímulo ou da resposta
    correto    acerto (True) ou erro (False), quando se aplica
    reacao_ms  tempo de reação, quando se aplica
    dados      extras; dados.pratica = True exclui o evento das métricas
"""

from __future__ import annotations

from dataclasses import dataclass
from statistics import median, pstdev
from typing import Any

VERSAO = "v1"

JOGOS: dict[str, dict[str, Any]] = {
    "atencao": {
        "nome": "Velocidade de Atenção",
        "dominios": {"atencao": 1.0, "executiva": 0.4},
        "metrica_chave": "tr_mediana_ms",  # maior = pior
    },
    "pares": {
        "nome": "Associação de Pares",
        "dominios": {"memoria": 1.0, "visuoespacial": 0.6},
        "metrica_chave": "pontuacao",
    },
    "categorias": {
        "nome": "Categorias",
        "dominios": {"linguagem": 1.0, "executiva": 0.6},
        "metrica_chave": "pontuacao",
    },
    "imagens": {
        "nome": "Associação de Imagens",
        "dominios": {"memoria": 1.0, "visuoespacial": 0.6, "linguagem": 0.4},
        "metrica_chave": "pontuacao",
    },
}

DOMINIOS = ["memoria", "atencao", "linguagem", "executiva", "visuoespacial"]


@dataclass
class Evento:
    t: float
    tipo: str
    alvo: str | None = None
    correto: bool | None = None
    reacao_ms: float | None = None
    dados: dict | None = None

    @property
    def pratica(self) -> bool:
        return bool((self.dados or {}).get("pratica"))


def _limitar(x: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, x))


def _cv(valores: list[float]) -> float | None:
    if len(valores) < 2:
        return None
    m = sum(valores) / len(valores)
    return round(pstdev(valores) / m, 4) if m else None


def calcular(jogo: str, eventos: list[Evento], contexto: dict | None = None) -> tuple[float, dict]:
    """Retorna (pontuação de 0 a 100, métricas brutas)."""
    validos = [e for e in eventos if not e.pratica]
    contexto = contexto or {}
    if jogo == "atencao":
        return _atencao(validos)
    if jogo == "pares":
        return _pares(validos)
    if jogo == "categorias":
        return _categorias(validos, contexto)
    if jogo == "imagens":
        return _imagens(validos)
    raise ValueError(f"Jogo desconhecido: {jogo}")


def _atencao(ev: list[Evento]) -> tuple[float, dict]:
    toques = [e for e in ev if e.tipo == "toque"]
    acertos = [e for e in toques if e.correto]
    erros = len(toques) - len(acertos)
    omissoes = sum(1 for e in ev if e.tipo == "omissao")
    trs = [e.reacao_ms for e in acertos if e.reacao_ms is not None and e.reacao_ms > 0]
    tr_med = round(median(trs), 1) if trs else None
    total = len(acertos) + erros + omissoes
    precisao = len(acertos) / total if total else 0.0
    # velocidade: 1 para 400 ms ou menos, 0 para 1.900 ms ou mais
    velocidade = _limitar((1900 - tr_med) / 1500, 0, 1) if tr_med is not None else 0.0
    pontuacao = round(_limitar(100 * (0.7 * precisao + 0.3 * velocidade)), 1)
    return pontuacao, {
        "acertos": len(acertos),
        "erros": erros,
        "omissoes": omissoes,
        "tr_mediana_ms": tr_med,
        "tr_cv": _cv(trs),
        "precisao": round(precisao, 4),
    }


def _pares(ev: list[Evento]) -> tuple[float, dict]:
    tentativas = [e for e in ev if e.tipo == "tentativa"]
    pares = sum(1 for e in tentativas if e.correto)
    perseveracoes = 0
    ultimo_erro: set[str] = set()
    for e in tentativas:
        cartas = set(map(str, (e.dados or {}).get("cartas", [])))
        if not e.correto:
            if cartas and cartas == ultimo_erro:
                perseveracoes += 1
            ultimo_erro = cartas
        else:
            ultimo_erro = set()
    primeiro = next((e.t for e in tentativas if e.correto), None)
    pontuacao = round(_limitar(100 * pares / len(tentativas)), 1) if tentativas else 0.0
    return pontuacao, {
        "pares": pares,
        "tentativas": len(tentativas),
        "tentativas_por_par": round(len(tentativas) / pares, 2) if pares else None,
        "perseveracoes": perseveracoes,
        "tempo_primeiro_acerto_ms": round(primeiro, 1) if primeiro is not None else None,
    }


def _categorias(ev: list[Evento], contexto: dict) -> tuple[float, dict]:
    toques = [e for e in ev if e.tipo == "toque"]
    acertos = sum(1 for e in toques if e.correto)
    intrusoes = len(toques) - acertos
    total = int(contexto.get("total_corretas") or acertos or 1)
    tempos = [e.t for e in toques if e.correto]
    tempo_por_item = round((max(tempos) / len(tempos)), 1) if tempos else None
    pontuacao = round(_limitar(100 * (acertos - 0.5 * intrusoes) / total), 1)
    return pontuacao, {
        "acertos": acertos,
        "intrusoes": intrusoes,
        "total_corretas": total,
        "tempo_por_item_ms": tempo_por_item,
    }


def _imagens(ev: list[Evento]) -> tuple[float, dict]:
    tentativas = [e for e in ev if e.tipo == "tentativa"]
    acertos = sum(1 for e in tentativas if e.correto)
    erros = len(tentativas) - acertos
    trs = [e.reacao_ms for e in tentativas if e.correto and e.reacao_ms]
    pontuacao = round(_limitar(100 * acertos / len(tentativas)), 1) if tentativas else 0.0
    return pontuacao, {
        "acertos": acertos,
        "erros": erros,
        "tr_mediana_ms": round(median(trs), 1) if trs else None,
    }
