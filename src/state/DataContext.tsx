import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, json } from "../api/client";
import type { IdosoEntrada, Insight, PacienteResumo, Painel, SessaoEntrada, SessaoSaida } from "../api/tipos";
import { paraInsight, paraPatient, paraSession, type AIInsight, type Patient, type Session } from "../data";

interface Dados {
  carregando: boolean;
  erro: string | null;
  nomeCuidador: string;
  patients: Patient[];
  recentSessions: Session[];
  sessionsToday: number;
  insights: AIInsight[];
  recarregar: () => Promise<void>;
  criarPessoa: (dados: IdosoEntrada) => Promise<Patient>;
  salvarSessao: (pacienteId: string, sessao: SessaoEntrada) => Promise<Session>;
  sessoesDe: (pacienteId: string) => Promise<Session[]>;
}

const DataCtx = createContext<Dados | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([api<Painel>("/painel"), api<Insight[]>("/insights")]);
      setPainel(p);
      setInsights(i);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const criarPessoa = useCallback(
    async (dados: IdosoEntrada) => {
      const r = await api<PacienteResumo>("/pacientes", json(dados));
      await recarregar();
      return paraPatient(r);
    },
    [recarregar],
  );

  const salvarSessao = useCallback(
    async (pacienteId: string, sessao: SessaoEntrada) => {
      const r = await api<SessaoSaida>(`/pacientes/${pacienteId}/sessoes`, json(sessao));
      await recarregar();
      return paraSession(r);
    },
    [recarregar],
  );

  const sessoesDe = useCallback(async (pacienteId: string) => {
    const r = await api<SessaoSaida[]>(`/pacientes/${pacienteId}/sessoes`);
    return r.map((s) => paraSession(s));
  }, []);

  const valor = useMemo<Dados>(
    () => ({
      carregando,
      erro,
      nomeCuidador: painel?.nome_cuidador ?? "",
      patients: (painel?.pacientes ?? []).map(paraPatient),
      recentSessions: (painel?.sessoes_recentes ?? []).map((s) => paraSession(s)),
      sessionsToday: painel?.sessoes_hoje ?? 0,
      insights: insights.map(paraInsight),
      recarregar,
      criarPessoa,
      salvarSessao,
      sessoesDe,
    }),
    [carregando, erro, painel, insights, recarregar, criarPessoa, salvarSessao, sessoesDe],
  );

  return <DataCtx.Provider value={valor}>{children}</DataCtx.Provider>;
}

export function useData(): Dados {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData fora do DataProvider");
  return ctx;
}

/** Sessões de uma pessoa, carregadas sob demanda. */
export function useSessoes(pacienteId: string | undefined, versao: number) {
  const { sessoesDe } = useData();
  const [sessoes, setSessoes] = useState<Session[] | null>(null);
  useEffect(() => {
    if (!pacienteId) return;
    let ativo = true;
    sessoesDe(pacienteId)
      .then((s) => ativo && setSessoes(s))
      .catch(() => ativo && setSessoes([]));
    return () => {
      ativo = false;
    };
  }, [pacienteId, versao, sessoesDe]);
  return sessoes;
}
