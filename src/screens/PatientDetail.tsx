import { Navigate } from "../App";
import { mockPatients, mockSessions, CognitiveMetrics } from "../data";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

function RadarChart({ metrics }: { metrics: CognitiveMetrics }) {
  const cx = 110, cy = 110, r = 80;
  const labels = ["Memória", "Atenção", "Linguagem", "Executiva", "Visuoespacial"];
  const values = [metrics.memory, metrics.attention, metrics.language, metrics.executive, metrics.visuospatial];
  const n = 5;
  const angle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });
  const polygon = (radii: number[]) =>
    radii.map((rad, i) => { const p = pt(i, rad); return `${p.x},${p.y}`; }).join(" ");
  const dataPoints = values.map((v) => (v / 100) * r);
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox="0 0 220 220" width="100%" height="180">
      {gridLevels.map((pct) => (
        <polygon key={pct} points={polygon(Array(n).fill(r * pct))} fill="none" stroke="#D4CFC5" strokeWidth="0.75" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const outer = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#D4CFC5" strokeWidth="0.75" />;
      })}
      <polygon points={polygon(dataPoints)} fill="#2C7A7A" fillOpacity="0.18" stroke="#2C7A7A" strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => { const p = pt(i, (v / 100) * r); return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2C7A7A" />; })}
      {labels.map((label, i) => {
        const p = pt(i, r + 22);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#5C7070" fontFamily="Nunito" fontWeight="700">
            {label}
          </text>
        );
      })}
      {values.map((v, i) => {
        const p = pt(i, (v / 100) * r);
        return (
          <text key={i} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="#2C7A7A" fontFamily="Nunito" fontWeight="800">
            {v}
          </text>
        );
      })}
    </svg>
  );
}

function MiniLineChart({ data }: { data: { week: string; avg: number }[] }) {
  const w = 300, h = 60, pad = 8;
  const minV = Math.min(...data.map(d => d.avg)) - 5;
  const maxV = Math.max(...data.map(d => d.avg)) + 5;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - 2 * pad);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.avg)}`).join(" ");
  const fill = `${path} L${x(data.length - 1)},${h} L${x(0)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="60">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C7A7A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2C7A7A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#lg)" />
      <path d={path} fill="none" stroke="#2C7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.avg)} r="2.5" fill="#2C7A7A" />)}
    </svg>
  );
}

const metricLabels: Record<keyof CognitiveMetrics, string> = {
  memory: "Memória",
  attention: "Atenção",
  language: "Linguagem",
  executive: "Função executiva",
  visuospatial: "Visuoespacial",
};

const metricColor = (v: number) =>
  v >= 65 ? "bg-accent" : v >= 45 ? "bg-primary" : "bg-error";

const metricTextColor = (v: number) =>
  v >= 65 ? "text-accent-dark" : v >= 45 ? "text-primary" : "text-error";

export default function PatientDetail({ navigate, selectedPatientId }: Props) {
  const patient = mockPatients.find((p) => p.id === selectedPatientId) ?? mockPatients[0];
  const sessions = mockSessions.filter((s) => s.patientId === patient.id);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("patients")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-2 border-2 border-white/30 flex-shrink-0">
              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-lg font-800 truncate">{patient.name}</h1>
              <p className="text-white/70 text-xs">{patient.diagnosis} · {patient.age} anos</p>
            </div>
            <button
              onClick={() => navigate("game-session", patient.id)}
              className="flex-shrink-0 h-9 px-4 bg-white text-primary rounded-full text-xs font-700 hover:bg-white/90 active:scale-[0.97] transition-all shadow-sm"
            >
              + Sessão
            </button>
          </div>
          {patient.alert && (
            <div className="mt-3 bg-error/20 border border-error/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-white text-xs font-600">{patient.alert}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-700 text-text">Perfil cognitivo</h2>
              <span className="text-xs text-text-muted">{patient.sessionCount} sessões registradas</span>
            </div>
            <RadarChart metrics={patient.metrics} />
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-sm font-700 text-text mb-3">Evolução — 8 semanas</h2>
            <MiniLineChart data={patient.history} />
            <div className="flex justify-between mt-1">
              {patient.history.map((d, i) => (
                <span key={i} className="text-[9px] text-text-light text-center">{d.week}</span>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-sm font-700 text-text mb-3">Métricas individuais</h2>
            <div className="flex flex-col gap-3">
              {(Object.keys(metricLabels) as (keyof CognitiveMetrics)[]).map((key) => {
                const v = patient.metrics[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs font-600 text-text-muted w-28 flex-shrink-0">{metricLabels[key]}</span>
                    <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${metricColor(v)} transition-all duration-500`} style={{ width: `${v}%` }} />
                    </div>
                    <span className={`text-xs font-800 w-8 text-right flex-shrink-0 ${metricTextColor(v)}`}>{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {patient.notes && (
            <div className="bg-primary/6 border border-primary/15 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs font-700 text-primary">Observações clínicas</span>
              </div>
              <p className="text-xs text-text leading-relaxed">{patient.notes}</p>
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-700 text-text">Sessões recentes</h2>
              <span className="text-xs text-text-muted">{sessions.length} total</span>
            </div>
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-text-muted">Nenhuma sessão registrada ainda.</div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i < sessions.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-700 text-text truncate">{s.game}</p>
                    <p className="text-[11px] text-text-muted">{s.date} · {s.duration} min · Nível {"★".repeat(s.level)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-800 ${s.score >= 80 ? "text-accent-dark" : s.score >= 60 ? "text-primary" : "text-error"}`}>{s.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pb-4">
            <button
              onClick={() => navigate("game-session", patient.id)}
              className="w-full h-12 bg-primary text-white rounded-2xl text-sm font-700 hover:bg-primary-light active:scale-[0.98] transition-all shadow-md"
            >
              Iniciar nova sessão com {patient.name.split(" ")[0]}
            </button>
          </div>
        </div>
      </div>

      <NavBar active="patients" navigate={navigate} />
    </div>
  );
}
