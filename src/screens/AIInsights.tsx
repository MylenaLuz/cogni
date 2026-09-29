import { useState } from "react";
import { Navigate } from "../App";
import { mockInsights, mockPatients, aiQuickReplies } from "../data";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

type FilterType = "all" | "improvement" | "alert" | "recommendation" | "trend";

const typeConfig = {
  improvement: { label: "Melhora", bg: "bg-accent/10", border: "border-accent/30", text: "text-accent-dark", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  )},
  alert: { label: "Alerta", bg: "bg-error/8", border: "border-error/30", text: "text-error", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )},
  recommendation: { label: "Recomendação", bg: "bg-primary/8", border: "border-primary/25", text: "text-primary", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )},
  trend: { label: "Tendência", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )},
};

interface ChatMessage { role: "user" | "ai"; text: string; }

export default function AIInsights({ navigate, selectedPatientId }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "ai", text: "Olá! Sou o assistente de análise cognitiva. Posso analisar os dados dos seus pacientes e fornecer insights e recomendações. Como posso ajudar?" }
  ]);
  const [thinking, setThinking] = useState(false);

  const filtered = mockInsights.filter((i) => {
    if (filter !== "all" && i.type !== filter) return false;
    if (patientFilter !== "all" && i.patientId !== patientFilter && i.patientId !== "all") return false;
    return true;
  });

  function handleSend(text?: string) {
    const q = text ?? chatInput.trim();
    if (!q) return;
    setChatHistory((h) => [...h, { role: "user", text: q }]);
    setChatInput("");
    setThinking(true);
    const match = aiQuickReplies.find((r) => q.toLowerCase().includes(r.question.split(" ")[1]?.toLowerCase() ?? ""));
    const answer = match?.answer ?? "Com base nos dados disponíveis, todos os indicadores estão sendo monitorados. Para uma análise mais específica, sugiro verificar os relatórios individuais de cada paciente na aba Relatórios.";
    setTimeout(() => {
      setChatHistory((h) => [...h, { role: "ai", text: answer }]);
      setThinking(false);
    }, 1200);
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
                <path d="M12 10c4 0 8 2 8 5v1H4v-1c0-3 4-5 8-5" />
                <path d="M8 21l2-4h4l2 4" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-800 text-white">Cogni IA</h1>
              <p className="text-white/60 text-xs">Análise cognitiva inteligente</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-white/70 text-xs font-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-5">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h2 className="text-sm font-700 text-text">Assistente IA</h2>
            </div>
            <div className="flex flex-col gap-3 p-4 max-h-64 overflow-y-auto">
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-surface-2 text-text rounded-tl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-surface-2 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-3 py-3 border-t border-border">
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {aiQuickReplies.slice(0, 3).map((r) => (
                  <button key={r.question} onClick={() => handleSend(r.question)}
                    className="text-[10px] font-600 text-primary border border-primary/25 rounded-full px-2.5 py-1 hover:bg-primary/8 transition-colors">
                    {r.question}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pergunte sobre os pacientes..."
                  className="flex-1 h-9 px-3 rounded-xl border-2 border-border bg-background text-xs focus:outline-none focus:border-primary transition-colors"
                />
                <button onClick={() => handleSend()} disabled={!chatInput.trim() || thinking}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-light disabled:opacity-40 transition-colors flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-700 text-text mb-3">Insights automáticos</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {(["all", "alert", "improvement", "recommendation", "trend"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`h-7 px-3 rounded-full text-[11px] font-700 transition-colors ${filter === f ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:border-primary/40"}`}>
                  {f === "all" ? "Todos" : typeConfig[f].label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mb-4 flex-wrap">
              <button onClick={() => setPatientFilter("all")} className={`h-7 px-3 rounded-full text-[11px] font-700 transition-colors ${patientFilter === "all" ? "bg-surface-2 text-text border border-border" : "text-text-muted hover:text-text"}`}>
                Todos
              </button>
              {mockPatients.map((p) => (
                <button key={p.id} onClick={() => setPatientFilter(p.id)} className={`h-7 px-3 rounded-full text-[11px] font-700 transition-colors ${patientFilter === p.id ? "bg-surface-2 text-text border border-border" : "text-text-muted hover:text-text"}`}>
                  {p.name.split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filtered.map((insight) => {
                const cfg = typeConfig[insight.type];
                return (
                  <div key={insight.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.text} bg-white/60`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-700 ${cfg.text}`}>{insight.title}</p>
                          <span className="text-[10px] text-text-light flex-shrink-0">{insight.date}</span>
                        </div>
                        {insight.patientId !== "all" && (
                          <p className="text-[10px] text-text-muted font-600 mt-0.5">{insight.patientName}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text leading-relaxed">{insight.message}</p>
                    {insight.type === "alert" && (
                      <button
                        onClick={() => navigate("patient-detail", insight.patientId !== "all" ? insight.patientId : "p3")}
                        className="mt-3 text-xs font-700 text-error border border-error/30 rounded-lg px-3 py-1.5 hover:bg-error/10 transition-colors"
                      >
                        Ver paciente →
                      </button>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="bg-surface rounded-2xl border border-border p-8 text-center text-xs text-text-muted">
                  Nenhum insight encontrado para os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NavBar active="ai-insights" navigate={navigate} />
    </div>
  );
}
