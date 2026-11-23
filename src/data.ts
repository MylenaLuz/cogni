// Tipos usados pelas telas e conversão dos dados da API para eles.

import type { Insight, Jogo, PacienteResumo, SessaoSaida } from "./api/tipos";

export interface CognitiveMetrics {
  memory: number;
  attention: number;
  language: number;
  executive: number;
  visuospatial: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  diagnosis: string;
  lastSession: string;
  sessionCount: number;
  index: number | null;
  metrics: CognitiveMetrics;
  history: { week: string; avg: number }[];
  trend: "up" | "down" | "stable";
  state: PacienteResumo["estado"];
  learning: { jogo: Jogo; faltam: number }[];
  alert?: string;
  notes?: string;
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  iso: string;
  game: string;
  duration: number;
  score: number;
  level: number;
  metrics: Record<string, number | null>;
  notes: string | null;
}

export interface AIInsight {
  id: string;
  patientId: string;
  patientName: string;
  type: "improvement" | "alert" | "recommendation" | "trend";
  title: string;
  message: string;
}

export const NOMES_JOGOS: Record<Jogo, string> = {
  atencao: "Velocidade de Atenção",
  pares: "Associação de Pares",
  categorias: "Categorias",
  imagens: "Associação de Imagens",
};

const dataHora = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function quandoRelativo(iso: string | null): string {
  if (!iso) return "Nenhuma sessão ainda";
  const d = new Date(iso);
  const hoje = new Date();
  const dias = Math.floor((new Date(hoje.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (dias === 0) return `Hoje, ${hora}`;
  if (dias === 1) return `Ontem, ${hora}`;
  return `Há ${dias} dias`;
}

export function paraPatient(p: PacienteResumo): Patient {
  const d = p.dominios;
  const semanas = p.historico.map((h, i) => ({ week: `S${i + 1}`, avg: h.media }));
  // semanas sem sessão repetem o último valor conhecido, para o gráfico não cair a zero
  let ultimo = semanas.find((s) => s.avg !== null)?.avg ?? 0;
  const history = semanas.map((s) => {
    if (s.avg !== null) ultimo = s.avg;
    return { week: s.week, avg: Math.round(ultimo) };
  });
  return {
    id: p.id,
    name: p.nome_completo,
    age: p.idade,
    diagnosis: p.condicao || "Condição não informada",
    lastSession: quandoRelativo(p.ultima_sessao),
    sessionCount: p.total_sessoes,
    index: p.indice === null ? null : Math.round(p.indice),
    metrics: {
      memory: Math.round(d.memoria ?? 0),
      attention: Math.round(d.atencao ?? 0),
      language: Math.round(d.linguagem ?? 0),
      executive: Math.round(d.executiva ?? 0),
      visuospatial: Math.round(d.visuoespacial ?? 0),
    },
    history,
    trend: p.tendencia,
    state: p.estado,
    learning: p.por_jogo.filter((j) => j.estado === "aprendendo").map((j) => ({ jogo: j.jogo, faltam: j.faltam })),
    alert: p.alerta ?? undefined,
    notes: p.observacoes ?? undefined,
  };
}

export function paraSession(s: SessaoSaida, nome = ""): Session {
  return {
    id: s.id,
    patientId: s.paciente_id,
    patientName: s.paciente_nome ?? nome,
    date: dataHora.format(new Date(s.iniciada_em)).replace(",", ""),
    iso: s.iniciada_em,
    game: NOMES_JOGOS[s.jogo] ?? s.jogo,
    duration: Math.max(1, Math.round(s.duracao_ms / 60000)),
    score: Math.round(s.pontuacao ?? 0),
    level: s.nivel,
    metrics: s.metricas,
    notes: s.observacoes,
  };
}

const TIPOS: Record<Insight["tipo"], AIInsight["type"]> = {
  alerta: "alert",
  melhora: "improvement",
  recomendacao: "recommendation",
  tendencia: "trend",
};

export function paraInsight(i: Insight, n: number): AIInsight {
  return {
    id: `${i.paciente_id}-${n}`,
    patientId: i.paciente_id,
    patientName: i.paciente_nome,
    type: TIPOS[i.tipo],
    title: i.titulo,
    message: i.mensagem,
  };
}

export function primeiroNome(nome: string): string {
  return nome.split(" ")[0] ?? nome;
}

/** Rótulo do estado em relação ao padrão da própria pessoa (linguagem não diagnóstica). */
export function rotuloEstado(estado: Patient["state"]): { label: string; cls: string } {
  return {
    aprendendo: { label: "Formando o padrão", cls: "bg-surface-2 text-text-muted" },
    estavel: { label: "Dentro do padrão", cls: "bg-primary/10 text-primary" },
    melhora: { label: "Acima do padrão", cls: "bg-accent/15 text-accent-dark" },
    piora: { label: "Abaixo do padrão", cls: "bg-error/10 text-error" },
  }[estado];
}

export const corIndice = (v: number) => (v >= 65 ? "text-accent-dark" : v >= 50 ? "text-primary" : "text-error");
