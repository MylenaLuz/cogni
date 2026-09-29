import { Navigate } from "../App";
import { mockCaregiver, mockPatients, mockSessions } from "../data";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const trendIcon = (t: "up" | "down" | "stable") =>
  t === "up"
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    : t === "down"
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D96B6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A9E9E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;

const avg = (m: { memory: number; attention: number; language: number; executive: number; visuospatial: number }) =>
  Math.round((m.memory + m.attention + m.language + m.executive + m.visuospatial) / 5);

export default function Dashboard({ navigate, selectedPatientId }: Props) {
  const alertPatient = mockPatients.find((p) => p.alert);
  const recentSessions = mockSessions.slice(0, 5);
  const todaySessions = mockSessions.filter((s) => s.date.startsWith("02/09")).length;

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-500">Olá,</p>
            <h1 className="text-white text-xl font-800">{mockCaregiver.name}</h1>
            <p className="text-white/60 text-xs font-500 mt-0.5">{mockCaregiver.specialty} · 2 de setembro de 2026</p>
          </div>
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 bg-surface-2">
            <img src={mockCaregiver.photo} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pacientes", value: mockPatients.length, color: "text-primary", sub: "ativos" },
              { label: "Sessões", value: todaySessions, color: "text-accent-dark", sub: "hoje" },
              { label: "Alertas", value: mockPatients.filter(p => p.alert).length, color: "text-error", sub: "críticos" },
            ].map((c) => (
              <div key={c.label} className="bg-surface rounded-2xl p-4 border border-border shadow-sm text-center">
                <div className={`text-3xl font-800 ${c.color}`}>{c.value}</div>
                <div className="text-xs font-600 text-text-muted mt-0.5 leading-tight">{c.label}</div>
                <div className="text-[10px] text-text-light">{c.sub}</div>
              </div>
            ))}
          </div>

          {alertPatient && (
            <div className="bg-error/8 border-2 border-error/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-error/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D96B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-error font-700 text-sm">Atenção — {alertPatient.name}</p>
                <p className="text-text-muted text-xs mt-0.5 leading-snug">{alertPatient.alert}</p>
              </div>
              <button
                onClick={() => navigate("patient-detail", alertPatient.id)}
                className="flex-shrink-0 text-xs font-700 text-error border border-error/30 rounded-lg px-3 py-1.5 hover:bg-error/10 transition-colors"
              >
                Ver
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-700 text-text">Pacientes</h2>
              <button onClick={() => navigate("patients")} className="text-xs font-700 text-primary hover:underline">Ver todos</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {mockPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate("patient-detail", p.id)}
                  className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-md active:scale-[0.99] transition-all text-left w-full"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-700 text-text truncate">{p.name}</p>
                      {trendIcon(p.trend)}
                      {p.alert && <span className="w-2 h-2 rounded-full bg-error flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{p.diagnosis} · {p.age} anos</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-base font-800 ${avg(p.metrics) >= 65 ? "text-accent-dark" : avg(p.metrics) >= 50 ? "text-primary" : "text-error"}`}>
                      {avg(p.metrics)}%
                    </span>
                    <p className="text-[10px] text-text-light">índice cognitivo</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-700 text-text">Sessões recentes</h2>
              <button onClick={() => navigate("reports")} className="text-xs font-700 text-primary hover:underline">Relatórios</button>
            </div>
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
              {recentSessions.map((s, i) => (
                <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i < recentSessions.length - 1 ? "border-b border-border" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.score >= 80 ? "bg-accent/10" : s.score >= 60 ? "bg-primary/10" : "bg-error/10"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.score >= 80 ? "#52B788" : s.score >= 60 ? "#2C7A7A" : "#D96B6B"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
                      <circle cx="15.5" cy="11" r="0.5" fill="currentColor" /><circle cx="17.5" cy="13" r="0.5" fill="currentColor" />
                      <rect x="2" y="6" width="20" height="12" rx="4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-700 text-text truncate">{s.patientName}</p>
                    <p className="text-[11px] text-text-muted truncate">{s.game} · {s.date}</p>
                  </div>
                  <span className={`text-sm font-800 flex-shrink-0 ${s.score >= 80 ? "text-accent-dark" : s.score >= 60 ? "text-primary" : "text-error"}`}>
                    {s.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4">
            <button onClick={() => navigate("games")} className="bg-primary text-white rounded-2xl p-4 flex items-center gap-3 hover:bg-primary-light active:scale-[0.98] transition-all shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
                <circle cx="15.5" cy="11" r="0.5" fill="white" /><circle cx="17.5" cy="13" r="0.5" fill="white" />
                <rect x="2" y="6" width="20" height="12" rx="4" />
              </svg>
              <span className="text-sm font-700">Nova sessão</span>
            </button>
            <button onClick={() => navigate("ai-insights")} className="bg-accent text-white rounded-2xl p-4 flex items-center gap-3 hover:bg-accent-dark active:scale-[0.98] transition-all shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-sm font-700">Ver insights IA</span>
            </button>
          </div>
        </div>
      </div>

      <NavBar active="dashboard" navigate={navigate} />
    </div>
  );
}
