"""
Simulacao de coorte sintetica para avaliar detectores de mudanca no Cogni.

Compara:
  (A) Regra atual do modelo de dados (fn_consolidar_indice): media semanal
      comparada com a semana anterior; variacao desfavoravel >= 5% => "declinio".
  (B) Detector proposto: baseline pessoal robusto (mediana e MAD) + CUSUM
      unilateral sobre escores z (Page, 1954).

Metrica simulada: tempo de reacao mediano por sessao (ms) no jogo de atencao.
Aumento do tempo de reacao = piora.

Todos os dados sao sinteticos. Nenhum dado de pessoa real foi usado.
Uso: python3 simular.py  (gera resultados.json e figuras PNG na mesma pasta)
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path

import numpy as np

SAIDA = Path(__file__).resolve().parent
SEMANAS = 52
SEMENTE = 20261119


@dataclass
class Paciente:
    base_ms: float          # tempo de reacao habitual
    sigma: float            # variabilidade intra-individual (ms)
    freq: int               # sessoes por semana
    declina: bool
    inicio: int | None      # semana de inicio do declinio
    taxa: float             # piora por semana, em unidades de sigma


def gerar_paciente(rng: np.random.Generator, freq: int, declina: bool, taxa: float) -> Paciente:
    base = rng.normal(900, 150)
    base = float(np.clip(base, 550, 1500))
    sigma = base * rng.uniform(0.06, 0.10)
    inicio = int(rng.integers(16, 31)) if declina else None
    return Paciente(base, sigma, freq, declina, inicio, taxa if declina else 0.0)


def gerar_sessoes(rng: np.random.Generator, p: Paciente) -> tuple[np.ndarray, np.ndarray]:
    """Retorna (semana de cada sessao, tempo de reacao de cada sessao)."""
    semanas, valores = [], []
    n = 0
    for s in range(SEMANAS):
        for _ in range(p.freq):
            aprendizado = 0.25 * p.base_ms * math.exp(-n / 3.0)       # primeiras sessoes mais lentas
            horario = rng.normal(0, 0.3 * p.sigma)                        # efeito do horario do dia
            ruido = rng.normal(0, p.sigma)
            dia_ruim = 3 * p.sigma if rng.random() < 0.05 else 0.0       # 5% de "dias ruins"
            declinio = 0.0
            if p.declina and s >= p.inicio:
                declinio = p.taxa * p.sigma * (s - p.inicio + 1)
            semanas.append(s)
            valores.append(p.base_ms + aprendizado + horario + ruido + dia_ruim + declinio)
            n += 1
    return np.array(semanas), np.array(valores)


# ---------------------------------------------------------------- detectores
def detector_regra_5pct(semanas: np.ndarray, valores: np.ndarray) -> list[int]:
    """Semanas em que a regra atual classificaria 'declinio'."""
    alarmes, anterior = [], None
    for s in range(SEMANAS):
        v = valores[semanas == s]
        if v.size == 0:
            continue
        media = v.mean()
        if anterior is not None and (media - anterior) / anterior >= 0.05:
            alarmes.append(s)
        anterior = media
    return alarmes


def detector_cusum(semanas: np.ndarray, valores: np.ndarray, k: float = 0.5, h: float = 8.0,
                   descarte: int = 6, n_base: int = 12) -> list[int]:
    """Baseline pessoal (mediana/MAD) apos descartar sessoes de aprendizado + CUSUM unilateral."""
    if valores.size < descarte + n_base + 1:
        return []
    base = valores[descarte:descarte + n_base]
    med = np.median(base)
    mad = np.median(np.abs(base - med)) * 1.4826
    mad = max(mad, 1e-6)
    s_acum, alarmes = 0.0, []
    for i in range(descarte + n_base, valores.size):
        z = (valores[i] - med) / mad
        z = min(z, 4.0)                      # limita outliers isolados ("dia ruim")
        s_acum = max(0.0, s_acum + z - k)
        if s_acum > h:
            alarmes.append(int(semanas[i]))
            s_acum = 0.0                     # reinicia apos alarme
    return alarmes


# ---------------------------------------------------------------- avaliacao
def avaliar(pacientes, sessoes, detector, **kw):
    detect, atrasos, falsos, anos_estaveis = 0, [], 0, 0.0
    n_decl, verdadeiros, total_alarmes = 0, 0, 0
    for p, (sem, val) in zip(pacientes, sessoes):
        alarmes = detector(sem, val, **kw)
        total_alarmes += len(alarmes)
        if p.declina:
            n_decl += 1
            pos = [a for a in alarmes if a >= p.inicio]
            verdadeiros += len([a for a in pos if a - p.inicio <= 20])
            if pos and pos[0] - p.inicio <= 20:
                detect += 1
                atrasos.append(pos[0] - p.inicio)
            falsos += len([a for a in alarmes if a < p.inicio])
            anos_estaveis += p.inicio / 52
        else:
            falsos += len(alarmes)
            anos_estaveis += 1.0
    return {
        "sensibilidade": detect / n_decl if n_decl else float("nan"),
        "atraso_mediano_semanas": float(np.median(atrasos)) if atrasos else float("nan"),
        "falsos_alarmes_por_paciente_ano": falsos / anos_estaveis,
        "precisao_alarmes": verdadeiros / total_alarmes if total_alarmes else float("nan"),
    }


def coorte(rng, n, freq, taxa):
    ps = [gerar_paciente(rng, freq, i % 2 == 0, taxa) for i in range(n)]
    return ps, [gerar_sessoes(rng, p) for p in ps]


def main():
    rng = np.random.default_rng(SEMENTE)
    resultados = {"semente": SEMENTE, "n_por_cenario": 400, "cenarios": []}
    for freq in (1, 2, 3):
        for taxa in (0.05, 0.10, 0.20):
            ps, ss = coorte(rng, 400, freq, taxa)
            r5 = avaliar(ps, ss, detector_regra_5pct)
            rc = avaliar(ps, ss, detector_cusum)
            resultados["cenarios"].append({"sessoes_por_semana": freq, "piora_sigma_por_semana": taxa,
                                           "regra_5pct": r5, "cusum": rc})

    # curva de compromisso do CUSUM (freq=2, taxa=0.10) variando o limiar h
    ps, ss = coorte(rng, 400, 2, 0.10)
    curva = []
    for h in (3, 4, 5, 6, 8, 10, 12, 15):
        r = avaliar(ps, ss, detector_cusum, h=h)
        curva.append({"h": h, **r})
    resultados["curva_h"] = curva
    r5 = avaliar(ps, ss, detector_regra_5pct)
    resultados["regra_5pct_ref"] = r5

    (SAIDA / "resultados.json").write_text(json.dumps(resultados, indent=2, ensure_ascii=False))
    figuras(rng, resultados)
    print(json.dumps(resultados, indent=2, ensure_ascii=False))


def figuras(rng, resultados):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update({"font.family": "Liberation Sans", "font.size": 10})

    # Figura 1: exemplo de trajetoria com alarmes
    p = Paciente(900, 70, 2, True, 24, 0.10)
    sem, val = gerar_sessoes(rng, p)
    a5 = detector_regra_5pct(sem, val)
    ac = detector_cusum(sem, val)
    fig, ax = plt.subplots(figsize=(8, 3.6), dpi=200)
    x = np.arange(val.size) / p.freq
    ax.plot(x, val, color="#2C7A7A", lw=1, marker="o", ms=2, label="Tempo de reação por sessão")
    base = val[6:18]
    med = np.median(base)
    mad = np.median(np.abs(base - med)) * 1.4826
    ax.axhspan(med - 2 * mad, med + 2 * mad, color="#52B788", alpha=0.18, label="Faixa pessoal (mediana ± 2 MAD)")
    ax.axvline(p.inicio, color="#555", ls="--", lw=1, label="Início simulado do declínio")
    for i, a in enumerate(a5):
        ax.axvline(a, color="#D96B6B", alpha=0.35, lw=0.8, label="Alarme da regra de 5%" if i == 0 else None)
    if ac:
        ax.axvline(ac[0], color="#1E5A5A", lw=2.2, label="Primeiro alarme do CUSUM")
    ax.set_xlabel("Semana")
    ax.set_ylabel("Tempo de reação mediano (ms)")
    ax.legend(fontsize=7, loc="upper left", ncol=2, frameon=False)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(SAIDA / "fig_trajetoria.png")
    plt.close(fig)

    # Figura 2: compromisso sensibilidade x falsos alarmes
    curva = resultados["curva_h"]
    fig, ax = plt.subplots(figsize=(6, 3.6), dpi=200)
    xs = [c["falsos_alarmes_por_paciente_ano"] for c in curva]
    ys = [c["sensibilidade"] for c in curva]
    ax.plot(xs, ys, marker="o", color="#2C7A7A", label="CUSUM (variando o limiar h)")
    for c in curva:
        ax.annotate(f"h={c['h']}", (c["falsos_alarmes_por_paciente_ano"], c["sensibilidade"]),
                    textcoords="offset points", xytext=(4, -10), fontsize=7)
    r5 = resultados["regra_5pct_ref"]
    ax.scatter([r5["falsos_alarmes_por_paciente_ano"]], [r5["sensibilidade"]], color="#D96B6B", zorder=3,
               label="Regra atual de 5%")
    ax.set_xscale("log")
    ax.set_xlabel("Falsos alarmes por paciente-ano (escala log)")
    ax.set_ylabel("Sensibilidade (detecção em até 20 semanas)")
    ax.set_ylim(0, 1.05)
    ax.legend(fontsize=8, frameon=False, loc="lower right")
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(SAIDA / "fig_compromisso.png")
    plt.close(fig)


if __name__ == "__main__":
    main()
