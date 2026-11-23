import { useState, type ReactNode } from "react";
import type { Navigate } from "../App";
import { NOMES_JOGOS, primeiroNome, type AIInsight, type Patient } from "../data";
import { useData } from "../state/DataContext";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

type FilterType = "all" | AIInsight["type"];

const icone = (d: ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const typeConfig: Record<AIInsight["type"], { label: string; bg: string; border: string; text: string; icon: ReactNode }> = {
  alert: {
    label: "Vale olhar", bg: "bg-error/8", border: "border-error/30", text: "text-error",
    icon: icone(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>),
  },
  improvement: {
    label: "Melhora", bg: "bg-accent/10", border: "border-accent/30", text: "text-accent-dark",
    icon: icone(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>),
  },
  recommendation: {
    label: "Sugestão", bg: "bg-primary/8", border: "border-primary/25", text: "text-primary",
    icon: icone(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
  },
  trend: {
    label: "Padrão em formação", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800",
    icon: icone(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  },
};

// Perguntas rápidas respondidas com os dados reais do painel (sem texto inventado).
const PERGUNTAS: { pergunta: string; responder: (p: Patient[], hoje: number) => string }[] = [
  {
    pergunta: "Quem precisa de atenção?",
    responder: (p) => {
      const lista = p.filter((x) => x.state === "piora");
      if (!lista.length) return "Ninguém está abaixo do próprio padrão agora.";
      return `${lista.map((x) => primeiroNome(x.name)).join(", ")} ${lista.length > 1 ? "estão" : "está"} abaixo do próprio padrão nas últimas sessões. Vale observar o dia a dia e, se fizer sentido, conversar com a equipe de saúde.`;
    },
  },
  {
    pergunta: "Quem melhorou?",
    responder: (p) => {
      const lista = p.filter((x) => x.state === "melhora");
      if (!lista.length) return "Ninguém está acima do próprio padrão agora.";
      return `${lista.map((x) => primeiroNome(x.name)).join(", ")} ${lista.length > 1 ? "estão" : "está"} acima do próprio padrão nas últimas sessões.`;
    },
  },
  {
    pergunta: "Quem ainda está formando o padrão?",
    responder: (p) => {
      const lista = p.filter((x) => x.learning.length > 0);
      if (!lista.length) return "Todas as pessoas já têm linha de base em pelo menos um jogo.";
      return lista
        .map((x) => `${primeiroNome(x.name)}: ${x.learning.map((l) => `${NOMES_JOGOS[l.jogo]} (faltam ${l.faltam})`).join(", ")}`)
        .join(". ") + ".";
    },
  },
  {
    pergunta: "Quantas sessões hoje?",
    responder: (_p, hoje) => (hoje ? `${hoje} ${hoje > 1 ? "sessões registradas" : "sessão registrada"} hoje.` : "Nenhuma sessão registrada hoje ainda."),
  },
];

export default function AIInsights({ navigate }: Props) {
  const { insights, patients, sessionsToday, carregando } = useData();
  const [filter, setFilter] = useState<FilterType>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [resposta, setResposta] = useState<{ pergunta: string; texto: string } | null>(null);

  const filtered = insights.filter((i) => {
    if (filter !== "all" && i.type !== filter) return false;
    if (patientFilter !== "all" && i.patientId !== patientFilter) return false;
    return true;
  });

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-800 text-white">Análises</h1>
          <p className="text-white/80 text-sm mt-0.5">Mudanças em relação ao padrão de cada pessoa</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-5">
          <details className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <summary className="text-base font-700 text-text cursor-pointer">Como o Cogni analisa</summary>
            <div className="text-sm text-text-muted leading-relaxed mt-3 flex flex-col gap-2">
              <p>Cada pessoa é comparada só com ela mesma. As primeiras sessões de cada jogo servem para aprender o jogo; as seguintes formam a linha de base.</p>
              <p>Depois disso, cada nova sessão é comparada com essa linha de base. Um aviso só aparece quando a mudança se repete por várias sessões, não por um dia ruim.</p>
              <p>O Cogni não faz diagnóstico. Ele mostra mudanças para você conversar com a equipe de saúde.</p>
            </div>
          </details>

          <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text mb-3">Perguntas rápidas</h2>
            <div className="flex gap-2 flex-wrap">
              {PERGUNTAS.map((q) => (
                <button
                  key={q.pergunta}
                  onClick={() => setResposta({ pergunta: q.pergunta, texto: q.responder(patients, sessionsToday) })}
                  aria-pressed={resposta?.pergunta === q.pergunta}
                  className={`text-sm font-600 rounded-full px-3 py-2 border transition-colors ${
                    resposta?.pergunta === q.pergunta ? "bg-primary text-white border-primary" : "text-primary border-primary/30 hover:bg-primary/8"
                  }`}
                >
                  {q.pergunta}
                </button>
              ))}
            </div>
            {resposta && (
              <p className="mt-3 bg-surface-2 rounded-xl px-4 py-3 text-sm text-text leading-relaxed" aria-live="polite">
                {resposta.texto}
              </p>
            )}
          </section>

          <section>
            <h2 className="text-base font-700 text-text mb-3">Avisos e sugestões</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {(["all", "alert", "improvement", "recommendation", "trend"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
                  className={`h-9 px-3 rounded-full text-sm font-700 transition-colors ${filter === f ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:border-primary/40"}`}>
                  {f === "all" ? "Todos" : typeConfig[f].label}
                </button>
              ))}
            </div>
            {patients.length > 1 && (
              <div className="flex gap-1.5 mb-4 flex-wrap">
                <button onClick={() => setPatientFilter("all")} aria-pressed={patientFilter === "all"} className={`h-9 px-3 rounded-full text-sm font-700 transition-colors ${patientFilter === "all" ? "bg-surface-2 text-text border border-border" : "text-text-muted hover:text-text"}`}>
                  Todas as pessoas
                </button>
                {patients.map((p) => (
                  <button key={p.id} onClick={() => setPatientFilter(p.id)} aria-pressed={patientFilter === p.id} className={`h-9 px-3 rounded-full text-sm font-700 transition-colors ${patientFilter === p.id ? "bg-surface-2 text-text border border-border" : "text-text-muted hover:text-text"}`}>
                    {primeiroNome(p.name)}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {filtered.map((insight) => {
                const cfg = typeConfig[insight.type];
                return (
                  <article key={insight.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.text} bg-white/60`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-base font-700 ${cfg.text}`}>{insight.title}</p>
                        <p className="text-sm text-text-muted font-600 mt-0.5">{insight.patientName}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text leading-relaxed">{insight.message}</p>
                    <button
                      onClick={() => navigate("patient-detail", insight.patientId)}
                      className={`mt-3 text-sm font-700 ${cfg.text} border ${cfg.border} rounded-lg px-3 py-2 hover:bg-white/50 transition-colors`}
                    >
                      Ver {primeiroNome(insight.patientName)} →
                    </button>
                  </article>
                );
              })}
              {!carregando && filtered.length === 0 && (
                <div className="bg-surface rounded-2xl border border-border p-8 text-center text-sm text-text-muted">
                  Nada para mostrar com esses filtros.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <NavBar active="ai-insights" navigate={navigate} />
    </div>
  );
}
