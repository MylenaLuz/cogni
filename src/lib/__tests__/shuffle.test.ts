import { describe, expect, it } from "vitest";
import { shuffle } from "../shuffle";

describe("shuffle", () => {
  it("mantém os mesmos itens e não altera a lista original", () => {
    const original = [1, 2, 3, 4, 5, 6];
    const r = shuffle(original);
    expect([...r].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("é uniforme (Fisher–Yates): cada item cai em cada posição ~1/n das vezes", () => {
    const n = 4;
    const vezes = 20000;
    const contagem = Array.from({ length: n }, () => Array(n).fill(0));
    for (let k = 0; k < vezes; k++) {
      shuffle([0, 1, 2, 3]).forEach((item, pos) => contagem[item][pos]++);
    }
    for (const linha of contagem) for (const c of linha) expect(Math.abs(c / vezes - 1 / n)).toBeLessThan(0.02);
  });
});
