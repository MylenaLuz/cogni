import { useState, useEffect, useRef } from "react";
import { Navigate } from "../../App";
import { mockPatients } from "../../data";
import GameHeader from "../../components/GameHeader";
import GameResult, { fmt } from "../../components/GameResult";

interface Props { navigate: Navigate; selectedPatientId: string; }

type Phase = "instructions" | "game" | "result";

interface Card { id: number; pairId: number; emoji: string; }
interface CardState { flipped: boolean; matched: boolean; wrong: boolean; }

const ALL_EMOJIS = ["🌺", "🐘", "🦋", "🎸", "🌙", "🍊"];

const LEVELS = [
  { label: "Básico",        desc: "4 pares · 8 cartas",  pairs: 4 },
  { label: "Intermediário", desc: "5 pares · 10 cartas", pairs: 5 },
  { label: "Avançado",      desc: "6 pares · 12 cartas", pairs: 6 },
];

function makeCards(pairs: number): Card[] {
  return ALL_EMOJIS.slice(0, pairs)
    .flatMap((emoji, i) => [
      { id: i * 2,     pairId: i, emoji },
      { id: i * 2 + 1, pairId: i, emoji },
    ])
    .sort(() => Math.random() - 0.5);
}

const CARD_BACK_COLOR = "bg-primary";

export default function MemoryPairs({ navigate, selectedPatientId }: Props) {
  const patient = mockPatients.find((p) => p.id === selectedPatientId) ?? mockPatients[0];
  const [phase, setPhase] = useState<Phase>("instructions");
  const [levelIdx, setLevelIdx] = useState(0);

  const [cards, setCards] = useState<Card[]>([]);
  const [states, setStates] = useState<CardState[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const checking = useRef(false);

  const cfg = LEVELS[levelIdx];

  // Elapsed timer
  useEffect(() => {
    if (phase !== "game") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Check completion
  useEffect(() => {
    if (phase === "game" && states.length > 0 && states.every((s) => s.matched)) {
      setTimeout(() => setPhase("result"), 600);
    }
  }, [states, phase]);

  function startGame() {
    const c = makeCards(LEVELS[levelIdx].pairs);
    setCards(c);
    setStates(c.map(() => ({ flipped: false, matched: false, wrong: false })));
    setFlipped([]);
    setAttempts(0);
    setErrors(0);
    setElapsed(0);
    checking.current = false;
    setPhase("game");
  }

  function handleTap(index: number) {
    if (checking.current) return;
    const s = states[index];
    if (!s || s.flipped || s.matched) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, index];
    setStates((prev) =>
      prev.map((st, i) => (i === index ? { ...st, flipped: true } : st))
    );
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      checking.current = true;
      setAttempts((a) => a + 1);
      const [a, b] = newFlipped;
      if (cards[a].pairId === cards[b].pairId) {
        setTimeout(() => {
          setStates((prev) =>
            prev.map((st, i) => newFlipped.includes(i) ? { ...st, matched: true } : st)
          );
          setFlipped([]);
          checking.current = false;
        }, 350);
      } else {
        setErrors((e) => e + 1);
        setStates((prev) =>
          prev.map((st, i) => newFlipped.includes(i) ? { ...st, wrong: true } : st)
        );
        setTimeout(() => {
          setStates((prev) =>
            prev.map((st, i) => newFlipped.includes(i) ? { ...st, flipped: false, wrong: false } : st)
          );
          setFlipped([]);
          checking.current = false;
        }, 1000);
      }
    }
  }

  const matchedPairs = states.filter((s) => s.matched).length / 2;
  const score = Math.round(
    (matchedPairs / cfg.pairs) * 100 * Math.max(0.4, 1 - (errors / (cfg.pairs * 3)))
  );

  if (phase === "instructions") {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6 fade-in">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="text-center px-2">
            <h1 className="text-2xl font-800 text-text">Associação de Pares</h1>
            <p className="text-text-muted text-base mt-2 leading-relaxed">
              Vire duas cartas por vez e encontre os pares iguais. Tente lembrar onde cada carta está!
            </p>
          </div>

          <div className="w-full flex flex-col gap-2">
            <p className="text-xs font-700 text-text-muted uppercase tracking-wide">Selecione o nível</p>
            {LEVELS.map((l, i) => (
              <button
                key={i}
                onClick={() => setLevelIdx(i)}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 border-2 transition-all text-left ${
                  levelIdx === i ? "border-accent bg-accent/8" : "border-border bg-surface hover:border-accent/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-800 flex-shrink-0 ${levelIdx === i ? "bg-accent text-white" : "bg-surface-2 text-text-muted"}`}>
                  {i + 1}
                </div>
                <div>
                  <p className={`text-sm font-700 ${levelIdx === i ? "text-accent-dark" : "text-text"}`}>{l.label}</p>
                  <p className="text-xs text-text-muted">{l.desc}</p>
                </div>
                {levelIdx === i && (
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full h-14 bg-accent text-white rounded-2xl text-lg font-700 hover:bg-accent-dark active:scale-[0.98] transition-all shadow-md"
          >
            Começar
          </button>
          <button onClick={() => navigate("games")} className="text-text-muted text-sm hover:text-text">
            ← Voltar aos jogos
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <GameResult
        patientName={patient.name}
        gameName="Associação de Pares"
        score={score}
        timeElapsed={elapsed}
        errors={errors}
        extraStats={[
          { label: "Pares encontrados", value: `${Math.round(matchedPairs)}/${cfg.pairs}` },
          { label: "Tentativas", value: String(attempts) },
        ]}
        notes={notes}
        onNotesChange={setNotes}
        onSave={() => { setSaved(true); setTimeout(() => navigate("patient-detail", patient.id), 1200); }}
        onDiscard={() => navigate("patient-detail", patient.id)}
        saved={saved}
      />
    );
  }

  const cols = cfg.pairs <= 4 ? "grid-cols-4" : cfg.pairs === 5 ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className="min-h-full bg-background flex flex-col">
      <GameHeader
        title="Associação de Pares"
        subtitle={`${patient.name.split(" ")[0]} · ${cfg.label}`}
        leftStat={{ label: "Pares", value: `${Math.round(matchedPairs)}/${cfg.pairs}` }}
        rightStat={{ label: "Tempo", value: fmt(elapsed) }}
        progress={matchedPairs / cfg.pairs}
        progressColor="bg-accent"
        onBack={() => setPhase("instructions")}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4">
        <p className="text-text-muted text-sm font-600 mb-5 text-center">
          Vire duas cartas e encontre os pares iguais
        </p>
        <div className={`grid ${cols} gap-3 w-full max-w-xs`}>
          {cards.map((card, i) => {
            const s = states[i];
            if (!s) return null;
            const isRevealed = s.flipped || s.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleTap(i)}
                disabled={s.matched || (flipped.length >= 2 && !flipped.includes(i))}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 border-2 text-3xl select-none
                  ${s.wrong ? "shake border-error bg-error/10" : ""}
                  ${s.matched ? "border-accent bg-accent/12 cursor-default pop" : ""}
                  ${!s.matched && !s.wrong && isRevealed ? "border-primary/40 bg-surface shadow-md" : ""}
                  ${!isRevealed && !s.wrong ? `${CARD_BACK_COLOR} border-primary-dark hover:opacity-90 active:scale-95` : ""}
                `}
              >
                {isRevealed ? (
                  s.matched ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{card.emoji}</span>
                  )
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-6 text-xs text-text-light font-600">
          <span>Tentativas: <strong className="text-text">{attempts}</strong></span>
          <span>·</span>
          <span>Erros: <strong className="text-error">{errors}</strong></span>
        </div>
      </div>
    </div>
  );
}
