import { useMemo, useState } from "react";
import type { Navigate } from "../App";
import { corIndice, primeiroNome, rotuloEstado, type CognitiveMetrics, type Session } from "../data";
import { useData, useSessoes } from "../state/DataContext";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const periods = ["Semana", "Mês", "3 meses"] as const;
type Period = typeof periods[number];
const DIAS: Record<Period, number> = { Semana: 7, "Mês": 30, "3 meses": 90 };
const SEMANA_MS = 7 * 86400000;

function sessoesPorSemana(sessoes: Session[]) {
  const agora = Date.now();
  return Array.from({ length: 8 }, (_, i) => {
    const semanasAtras = 7 - i;
    const fim = agora - semanasAtras * SEMANA_MS;
    const inicio = fim - SEMANA_MS;
    const n = sessoes.filter((s) => {
      const t = new Date(s.iso).getTime();
      return t > inicio && t <= fim;
    }).length;
    return { label: semanasAtras === 0 ? "Esta" : `S-${semanasAtras}`, value: n };
  });
}

function baixarCsv(nome: string, sessoes: Session[]) {
  const linhas = [
    ["data", "jogo", "nivel", "duracao_min", "pontuacao", "observacoes"],
    ...sessoes.map((s) => [s.iso, s.game, String(s.level), String(s.duration), String(s.score), s.notes ?? ""]),
  ];
  const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `cogni-${nome.toLowerCase().replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LineChart({ data, color = "#2C7A7A" }: { data: { label: string; value: number }[]; color?: string }) {
  const w = 320, h = 80, pad = 12;
  const values = data.map(d => d.value);
  const minV = Math.max(0, Math.min(...values) - 10);
  const maxV = Math.min(100, Math.max(...values) + 10);
  const x = (i: number) => pad + (data.length > 1 ? i / (data.length - 1) : 0.5) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - minV) / (maxV - minV || 1)) * (h - 2 * pad);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const fill = `${path} L${x(data.length - 1)},${h} L${x(0)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="80" overflow="visible" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      <defs>
        <linearGradient id={`lg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#lg-${color.replace("#","")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r="3.5" fill={color} />
          <text x={x(i)} y={h + 4} textAnchor="middle" fontSize="9" fill="#5F7272" fontFamily="Nunito" fontWeight="700">{d.label}</text>
          <text x={x(i)} y={y(d.value) - 8} textAnchor="middle" fontSize="9" fill={color} fontFamily="Nunito" fontWeight="800">{d.value}</text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 320, h = 60, pad = 12;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const barW = (w - 2 * pad) / data.length - 6;
  return (
    <svg viewBox={`0 0 ${w} ${h + 16}`} width="100%" height="76" role="img" aria-label={data.map((d) => `${d.label}: ${d.value} sessões`).join(", ")}>
      {data.map((d, i) => {
        const bx = pad + i * ((w - 2 * pad) / data.length) + 3;
        const bh = (d.value / maxV) * (h - 10);
        const by = h - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={d.value > 0 ? "#2C7A7A" : "#EDE8DF"} rx="3" opacity={d.value > 0 ? 1 : 0.5} />
            <text x={bx + barW / 2} y={h + 12} textAnchor="middle" fontSize="9" fill="#5F7272" fontFamily="Nunito" fontWeight="700">{d.label}</text>
            {d.value > 0 && <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize="9" fill="#2C7A7A" fontFamily="Nunito" fontWeight="800">{d.value}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const metricColors: Record<keyof CognitiveMetrics, string> = {
  memory: "#2C7A7A",
  attention: "#52B788",
  language: "#E8A838",
  executive: "#7C5CBF",
  visuospatial: "#E07070",
};
const metricNames: Record<keyof CognitiveMetrics, string> = {
  memory: "Memória",
  attention: "Atenção",
  language: "Linguagem",
  executive: "Executiva",
  visuospatial: "Visuoespacial",
};

export default function Reports({ navigate, selectedPatientId }: Props) {
  const { patients, carregando } = useData();
  const [escolhido, setPatientId] = useState(selectedPatientId);
  const [period, setPeriod] = useState<Period>("Mês");

  const patient = patients.find((p) => p.id === escolhido) ?? patients[0];
  const patientId = patient?.id;
  const todas = useSessoes(patientId, patient?.sessionCount ?? 0) ?? [];
  const sessions = useMemo(() => {
    const limite = Date.now() - DIAS[period] * 86400000;
    return todas.filter((s) => new Date(s.iso).getTime() >= limite);
  }, [todas, period]);

  if (!patient) {
    return (
      <div className="min-h-full bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-base text-text-muted" role="status">{carregando ? "Carregando…" : "Cadastre uma pessoa para ver relatórios."}</p>
        </div>
        <NavBar active="reports" navigate={navigate} />
      </div>
    );
  }

  const avg = patient.index;
  const estado = rotuloEstado(patient.state);
  const historyChart = patient.history.map((h) => ({ label: h.week, value: h.avg }));
  const weeklySessionsChart = sessoesPorSemana(todas);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-800 text-white">Relatórios</h1>
            <p className="text-white/80 text-sm mt-0.5">Desempenho nos jogos</p>
          </div>
          <button
            onClick={() => baixarCsv(patient.name, todas)}
            disabled={todas.length === 0}
            className="h-10 px-4 rounded-full text-sm font-700 transition-all flex items-center gap-2 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 bg-surface rounded-xl border border-border p-1 flex-1">
              {patients.map((p) => (
                <button key={p.id} onClick={() => setPatientId(p.id)} aria-pressed={patientId === p.id}
                  className={`flex-1 h-10 rounded-lg text-sm font-700 transition-colors truncate px-2 ${patientId === p.id ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}>
                  {primeiroNome(p.name)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {periods.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
                className={`h-10 px-4 rounded-full text-sm font-700 transition-colors ${period === p ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:border-primary/50"}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Índice dos jogos", value: avg === null ? "—" : String(avg), sub: estado.label, color: avg === null ? "text-text-muted" : corIndice(avg) },
              { label: "Sessões", value: sessions.length.toString(), sub: "no período", color: "text-primary" },
              { label: "Duração média", value: `${Math.round(sessions.reduce((s, s2) => s + s2.duration, 0) / Math.max(sessions.length, 1))} min`, sub: "por sessão", color: "text-text" },
            ].map((c) => (
              <div key={c.label} className="bg-surface rounded-2xl border border-border shadow-sm p-3 text-center">
                <div className={`text-xl font-800 ${c.color}`}>{c.value}</div>
                <div className="text-xs text-text-muted mt-0.5 font-600">{c.label}</div>
                <div className="text-xs text-text-light">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text mb-4">Evolução do índice — 8 semanas</h2>
            <LineChart data={historyChart} />
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text mb-4">Sessões por semana</h2>
            <BarChart data={weeklySessionsChart} />
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text mb-3">Por domínio</h2>
            <div className="flex flex-col gap-2.5">
              {(Object.keys(metricNames) as (keyof CognitiveMetrics)[]).map((key) => {
                const v = patient.metrics[key];
                const color = metricColors[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm font-600 text-text-muted w-28 flex-shrink-0">{metricNames[key]}</span>
                    <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                      {v !== null && <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />}
                    </div>
                    {v === null ? (
                      <span className="text-xs text-text-muted w-16 text-right flex-shrink-0">sem dados</span>
                    ) : (
                      <span className="text-sm font-800 w-16 text-right flex-shrink-0" style={{ color }}>{v}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-base font-700 text-text">Sessões no período — {primeiroNome(patient.name)}</h2>
            </div>
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">Nenhuma sessão neste período.</div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i < sessions.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-700 text-text truncate">{s.game}</p>
                    <p className="text-sm text-text-muted">{s.date} · {s.duration} min · Nível {s.level}</p>
                    {s.notes && <p className="text-sm text-text mt-1 bg-surface-2 rounded-lg px-2.5 py-1.5 whitespace-pre-line">“{s.notes}”</p>}
                  </div>
                  <span className={`text-base font-800 ${corIndice(s.score)}`}>{s.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NavBar active="reports" navigate={navigate} />
    </div>
  );
}
