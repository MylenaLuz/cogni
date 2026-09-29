import { useState, useEffect } from "react";
import { Navigate } from "../App";
import { mockPatients } from "../data";

interface Props { navigate: Navigate; selectedPatientId: string; }

const gamePairs = [
  { id: 1, emoji: "🌷", word: "Rosa" },
  { id: 2, emoji: "🐕", word: "Cachorro" },
  { id: 3, emoji: "☀️", word: "Sol" },
  { id: 4, emoji: "🌊", word: "Mar" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function GameSession({ navigate, selectedPatientId }: Props) {
  const patient = mockPatients.find((p) => p.id === selectedPatientId) ?? mockPatients[0];
  const [level, setLevel] = useState<1 | 2 | 3 | null>(null);
  const [shuffledWords] = useState(() => shuffle(gamePairs));
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongWord, setWrongWord] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (level === null || done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [level, done]);

  useEffect(() => {
    if (matched.length === gamePairs.length) {
      setTimeout(() => setDone(true), 500);
    }
  }, [matched]);

  function fmt(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleImageClick(id: number) {
    if (matched.includes(id)) return;
    setSelectedImage(id === selectedImage ? null : id);
    setWrongWord(null);
  }

  function handleWordClick(id: number) {
    if (matched.includes(id) || selectedImage === null) return;
    if (selectedImage === id) {
      setMatched((m) => [...m, id]);
      setSelectedImage(null);
    } else {
      setErrors((e) => e + 1);
      setWrongWord(id);
      setTimeout(() => { setWrongWord(null); setSelectedImage(null); }, 700);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate("patient-detail", patient.id), 1200);
  }

  if (!level) {
    return (
      <div className="min-h-full bg-background flex flex-col">
        <div className="bg-primary px-5 pt-10 pb-5">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate("games")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-800 text-white">Associação de Imagens</h1>
              <p className="text-white/70 text-xs">{patient.name}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="max-w-sm w-full">
            <h2 className="text-base font-700 text-text mb-1">Selecione o nível</h2>
            <p className="text-xs text-text-muted mb-5">Recomendado: nível {patient.metrics.memory >= 65 ? 3 : patient.metrics.memory >= 45 ? 2 : 1} para {patient.name.split(" ")[0]}</p>
            <div className="flex flex-col gap-3">
              {([1, 2, 3] as const).map((l) => (
                <button key={l} onClick={() => setLevel(l)} className="w-full bg-surface border-2 border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary hover:shadow-md active:scale-[0.98] transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-800 text-primary flex-shrink-0">{l}</div>
                  <div>
                    <p className="text-sm font-700 text-text">{["Básico", "Intermediário", "Avançado"][l - 1]}</p>
                    <p className="text-xs text-text-muted">{["2 pares, tempo estendido", "4 pares, tempo padrão", "6 pares, tempo reduzido"][l - 1]}</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < l ? "bg-accent" : "bg-border"}`} />)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const score = Math.round(((gamePairs.length / (gamePairs.length + errors)) * 100));
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col gap-5 fade-in">
          <div className="bg-surface rounded-2xl border border-border shadow-md p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-800 text-text">Sessão concluída!</h2>
            <p className="text-text-muted text-sm mt-1">{patient.name}</p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Pontuação", value: `${score}%`, color: score >= 75 ? "text-accent-dark" : score >= 50 ? "text-primary" : "text-error" },
                { label: "Duração", value: fmt(elapsed), color: "text-text" },
                { label: "Erros", value: errors.toString(), color: errors <= 1 ? "text-accent-dark" : "text-error" },
              ].map((s) => (
                <div key={s.label} className="bg-background rounded-xl p-3 text-center">
                  <div className={`text-xl font-800 ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <label className="block text-xs font-700 text-text mb-2">Observações da sessão (opcional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: paciente apresentou dificuldade com pares visuais, mas boa concentração..."
              className="w-full px-3 py-2 rounded-xl border-2 border-border bg-background text-text text-xs focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full h-12 rounded-2xl text-sm font-700 transition-all shadow-md active:scale-[0.98] ${saved ? "bg-accent text-white" : "bg-primary text-white hover:bg-primary-light"}`}
          >
            {saved ? "✓ Sessão salva!" : "Salvar e voltar ao perfil"}
          </button>
          <button onClick={() => navigate("patient-detail", patient.id)} className="text-text-muted text-sm text-center hover:text-text">
            Descartar e voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => { setLevel(null); setMatched([]); setErrors(0); setSelectedImage(null); }} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="flex-1">
              <h1 className="text-white text-base font-800">Associação de Imagens — Nível {level}</h1>
              <p className="text-white/60 text-xs">{patient.name} · {fmt(elapsed)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(matched.length / gamePairs.length) * 100}%` }} />
            </div>
            <span className="text-white/80 text-xs font-600">{matched.length}/{gamePairs.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 max-w-sm mx-auto w-full flex flex-col">
        <p className="text-text-muted text-sm text-center mb-5 font-500">Selecione uma imagem e depois sua palavra</p>
        <div className="grid grid-cols-2 gap-5 flex-1">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-text-muted font-700 uppercase tracking-wider text-center">Imagens</p>
            {gamePairs.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isSelected = selectedImage === pair.id;
              return (
                <button key={pair.id} onClick={() => handleImageClick(pair.id)} disabled={isMatched}
                  className={`h-16 rounded-2xl text-3xl flex items-center justify-center border-3 transition-all duration-200
                    ${isMatched ? "bg-accent/12 border-accent cursor-default" : isSelected ? "bg-primary/10 border-primary scale-[1.03] shadow-md" : "bg-surface border-border hover:border-primary/40 active:scale-[0.97]"}`}>
                  {isMatched ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : pair.emoji}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-text-muted font-700 uppercase tracking-wider text-center">Palavras</p>
            {shuffledWords.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isWrong = wrongWord === pair.id;
              return (
                <button key={pair.id} onClick={() => handleWordClick(pair.id)} disabled={isMatched}
                  className={`h-16 rounded-2xl text-base font-700 flex items-center justify-center border-3 transition-all duration-200
                    ${isMatched ? "bg-accent/12 border-accent text-accent-dark cursor-default" : isWrong ? "bg-error/10 border-error text-error shake" : selectedImage !== null ? "bg-surface border-border hover:border-accent/50 hover:bg-accent/5 active:scale-[0.97] text-text cursor-pointer" : "bg-surface border-border text-text-muted"}`}>
                  {pair.word}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
