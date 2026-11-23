// Prévia da pontuação v1, igual à calculada no servidor (backend/app/services/pontuacao.py).
// Serve para mostrar o resultado na hora; o valor gravado é sempre o do servidor.

import type { EventoSessao, Jogo } from "../api/tipos";

const limitar = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

function mediana(v: number[]): number | null {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function pontuacaoPrevia(jogo: Jogo, eventos: EventoSessao[], contexto: Record<string, unknown> = {}): number {
  const ev = eventos.filter((e) => !e.dados?.pratica);
  if (jogo === "atencao") {
    const toques = ev.filter((e) => e.tipo === "toque");
    const acertos = toques.filter((e) => e.correto);
    const erros = toques.length - acertos.length;
    const omissoes = ev.filter((e) => e.tipo === "omissao").length;
    const tr = mediana(acertos.map((e) => e.reacao_ms ?? 0).filter((x) => x > 0));
    const total = acertos.length + erros + omissoes;
    const precisao = total ? acertos.length / total : 0;
    const velocidade = tr === null ? 0 : limitar((1900 - tr) / 1500, 0, 1);
    return Math.round(limitar(100 * (0.7 * precisao + 0.3 * velocidade)));
  }
  if (jogo === "categorias") {
    const toques = ev.filter((e) => e.tipo === "toque");
    const acertos = toques.filter((e) => e.correto).length;
    const total = Number(contexto.total_corretas) || acertos || 1;
    return Math.round(limitar((100 * (acertos - 0.5 * (toques.length - acertos))) / total));
  }
  // pares e imagens: proporção de tentativas corretas
  const tentativas = ev.filter((e) => e.tipo === "tentativa");
  if (!tentativas.length) return 0;
  return Math.round(limitar((100 * tentativas.filter((e) => e.correto).length) / tentativas.length));
}
