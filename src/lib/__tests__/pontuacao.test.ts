import { describe, expect, it } from "vitest";
import type { EventoSessao } from "../../api/tipos";
import { pontuacaoPrevia } from "../pontuacao";

const ev = (e: Partial<EventoSessao> & Pick<EventoSessao, "tipo">): EventoSessao => ({ t: 0, ...e });

describe("pontuação v1 (mesma regra do servidor)", () => {
  it("atenção: só acertos rápidos dão 100", () => {
    const eventos = Array.from({ length: 10 }, () => ev({ tipo: "toque", correto: true, reacao_ms: 400 }));
    expect(pontuacaoPrevia("atencao", eventos)).toBe(100);
  });

  it("atenção: omissões e erros reduzem a precisão", () => {
    const eventos = [
      ev({ tipo: "toque", correto: true, reacao_ms: 1900 }),
      ev({ tipo: "toque", correto: false }),
      ev({ tipo: "omissao" }),
      ev({ tipo: "omissao" }),
    ];
    // precisão 1/4, velocidade 0 → 100 × 0,7 × 0,25
    expect(pontuacaoPrevia("atencao", eventos)).toBe(18);
  });

  it("pares: proporção de tentativas certas, ignorando a prática", () => {
    const eventos = [
      ev({ tipo: "tentativa", correto: false, dados: { pratica: true } }),
      ev({ tipo: "tentativa", correto: true }),
      ev({ tipo: "tentativa", correto: false }),
    ];
    expect(pontuacaoPrevia("pares", eventos)).toBe(50);
  });

  it("categorias: intrusões descontam meio ponto e nunca fica negativo", () => {
    const certo = ev({ tipo: "toque", correto: true });
    const errado = ev({ tipo: "toque", correto: false });
    expect(pontuacaoPrevia("categorias", [certo, certo, certo, certo, errado], { total_corretas: 5 })).toBe(70);
    expect(pontuacaoPrevia("categorias", [errado, errado], { total_corretas: 5 })).toBe(0);
  });
});
