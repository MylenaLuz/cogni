interface Props {
  patientName: string;
  gameName: string;
  score: number;
  timeElapsed: number;
  errors: number;
  extraStats?: { label: string; value: string }[];
  notes: string;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  saved: boolean;
}

export function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function GameResult({
  patientName,
  gameName,
  score,
  timeElapsed,
  errors,
  extraStats,
  notes,
  onNotesChange,
  onSave,
  onDiscard,
  saved,
}: Props) {
  const isGood = score >= 55;
  const badge = score >= 80 ? "Excelente!" : score >= 55 ? "Muito bem!" : "Continue tentando!";
  const scoreColor = score >= 80 ? "text-accent-dark" : score >= 55 ? "text-primary" : "text-error";

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-5 py-8">
      <div className="max-w-sm w-full flex flex-col gap-4 fade-in">
        <div className="bg-surface rounded-2xl border border-border shadow-md p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${isGood ? "bg-accent/15" : "bg-error/10"}`}>
            {isGood ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D96B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-800 text-text">{badge}</h2>
          <p className="text-text-muted text-sm mt-0.5">{patientName} · {gameName}</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Pontuação", value: `${score}%`, color: scoreColor },
              { label: "Duração", value: fmt(timeElapsed), color: "text-text" },
              { label: "Erros", value: String(errors), color: errors === 0 ? "text-accent-dark" : errors <= 2 ? "text-primary" : "text-error" },
            ].map((s) => (
              <div key={s.label} className="bg-background rounded-xl p-3 text-center">
                <div className={`text-2xl font-800 ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-text-muted mt-0.5 font-600">{s.label}</div>
              </div>
            ))}
          </div>

          {extraStats && extraStats.length > 0 && (
            <div className={`grid gap-2 mt-3 ${extraStats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {extraStats.map((s) => (
                <div key={s.label} className="bg-background rounded-xl p-2.5 text-center">
                  <div className="text-base font-800 text-primary">{s.value}</div>
                  <div className="text-[10px] text-text-muted font-600">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
          <label className="block text-xs font-700 text-text mb-2">Observações da sessão</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Ex: paciente demonstrou boa concentração e manteve o foco..."
            className="w-full px-3 py-2 rounded-xl border-2 border-border bg-background text-xs text-text focus:outline-none focus:border-primary resize-none transition-colors"
          />
        </div>

        <button
          onClick={onSave}
          className={`w-full h-12 rounded-2xl text-sm font-700 transition-all shadow-md active:scale-[0.98] ${
            saved ? "bg-accent text-white" : "bg-primary text-white hover:bg-primary-light"
          }`}
        >
          {saved ? "✓ Sessão salva!" : "Salvar sessão"}
        </button>
        <button
          onClick={onDiscard}
          className="text-text-muted text-sm text-center hover:text-text pb-2"
        >
          Descartar e sair
        </button>
      </div>
    </div>
  );
}
