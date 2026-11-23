import { useCallback, useRef } from "react";
import type { EventoSessao } from "../api/tipos";

/**
 * Grava os eventos brutos de uma sessão com o relógio monotônico do navegador
 * (performance.now), com resolução abaixo de 1 ms. O servidor calcula as métricas.
 */
export function useSessionRecorder() {
  const inicio = useRef<{ t0: number; data: Date } | null>(null);
  const eventos = useRef<EventoSessao[]>([]);

  const iniciar = useCallback(() => {
    inicio.current = { t0: performance.now(), data: new Date() };
    eventos.current = [];
  }, []);

  /** Tempo, em ms, desde o início da sessão. */
  const agora = useCallback(() => (inicio.current ? performance.now() - inicio.current.t0 : 0), []);

  const registrar = useCallback(
    (evento: Omit<EventoSessao, "t">) => {
      if (!inicio.current) return;
      eventos.current.push({ ...evento, t: Math.round(agora() * 10) / 10 });
    },
    [agora],
  );

  const finalizar = useCallback(() => {
    const ini = inicio.current?.data ?? new Date();
    return {
      iniciada_em: ini.toISOString(),
      finalizada_em: new Date().toISOString(),
      eventos: [...eventos.current],
    };
  }, []);

  return { iniciar, registrar, agora, finalizar };
}
