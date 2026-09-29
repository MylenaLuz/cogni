import { useState, useEffect } from "react";
import { Navigate } from "../../App";
import { mockPatients } from "../../data";
import GameHeader from "../../components/GameHeader";
import GameResult from "../../components/GameResult";

interface Props { navigate: Navigate; selectedPatientId: string; }

type Phase = "instructions" | "game" | "result";
type ChipState = "neutral" | "correct" | "wrong";

interface Item { word: string; correct: boolean; }

interface LevelConfig {
  label: string;
  category: string;
  items: Item[];
  timeLimit: number;
  desc: string;
}

const LEVELS: LevelConfig[] = [
  {
    label: "Básico",
    category: "Frutas",
    desc: "5 itens corretos · 3 distratores · 30 s",
    timeLimit: 30,
    items: [
      { word: "Maçã",    correct: true  },
      { word: "Banana",  correct: true  },
      { word: "Uva",     correct: true  },
      { word: "Laranja", correct: true  },
      { word: "Pera",    correct: true  },
      { word: "Cenoura", correct: false },
      { word: "Batata",  correct: false },
      { word: "Carne",   correct: false },
    ],
  },
  {
    label: "Intermediário",
    category: "Animais",
    desc: "5 itens corretos · 4 distratores · 25 s",
    timeLimit: 25,
    items: [
      { word: "Gato",     correct: true  },
      { word: "Leão",     correct: true  },
      { word: "Peixe",    correct: true  },
      { word: "Pássaro",  correct: true  },
      { word: "Coelho",   correct: true  },
      { word: "Mesa",     correct: false },
      { word: "Cadeira",  correct: false },
      { word: "Caneta",   correct: false },
      { word: "Óculos",   correct: false },
    ],
  },
  {
    label: "Avançado",
    category: "Objetos de cozinha",
    desc: "5 itens corretos · 5 distratores · 20 s",
    timeLimit: 20,
    items: [
      { word: "Panela",  correct: true  },
      { word: "Faca",    correct: true  },
      { word: "Colher",  correct: true  },
      { word: "Prato",   correct: true  },
      { word: "Garfo",   correct: true  },
      { word: "Livro",   correct: false },
      { word: "Bola",    correct: false },
      { word: "Sapato",  correct: false },
      { word: "Régua",   correct: false },
      { word: "Lápis",   correct: false },
    ],
  },
];

export default function Categories({ navigate, selectedPatientId }: Props) {
  const patient = mockPatients.find((p) => p.id === selectedPatientId) ?? mockPatients[0];
  const [phase, setPhase] = useState<Phase>("instructions");
  const [levelIdx, setLevelIdx] = useState(0);
  const cfg = LEVELS[levelIdx];

  const [chipStates, setChipStates] = useState<ChipState[]>([]);
  const [shaking, setShaking] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(cfg.timeLimit);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // Countdown
  useEffect(() => {
    if (phase !== "game") return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) { setPhase("result"); return 0; }
        return tl - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  function handleChipTap(index: number) {
    if (chipStates[index] !== "neutral") return;
    const item = shuffledItems[index];
    if (item.correct) {
      setChipStates((prev) => {
        const next = [...prev];
        next[index] = "correct";
        return next;
      });
    } else {
      setShaking(index);
      setChipStates((prev) => {
        const next = [...prev];
        next[index] = "wrong";
        return next;
      });
      setTimeout(() => {
        setShaking(null);
        // Keep as wrong (greyed out, can't re-tap)
      }, 600);
    }
  }

  // Stable shuffled order per game start
  const [shuffledItems, setShuffledItems] = useState<Item[]>([]);
  function startGameFull() {
    const shuffled = [...LEVELS[levelIdx].items].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
    setChipStates(shuffled.map(() => "neutral"));
    setShaking(null);
    setTimeLeft(LEVELS[levelIdx].timeLimit);
    setElapsed(0);
    setPhase("game");
  }

  const correctItems = (shuffledItems.length ? shuffledItems : cfg.items).filter((i) => i.correct).length;
  const correctHits = chipStates.filter((s) => s === "correct").length;
  const wrongHits = chipStates.filter((s) => s === "wrong").length;
  const score = Math.min(100, Math.max(0, Math.round(((correctHits - wrongHits * 0.5) / correctItems) * 100)));

  if (phase === "instructions") {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6 fade-in">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div className="text-center px-2">
            <h1 className="text-2xl font-800 text-text">Categorias</h1>
            <p className="text-text-muted text-base mt-2 leading-relaxed">
              Toque em todas as palavras que pertencem à categoria antes do tempo acabar!
            </p>
          </div>

          <div className="w-full flex flex-col gap-2">
            <p className="text-xs font-700 text-text-muted uppercase tracking-wide">Selecione o nível</p>
            {LEVELS.map((l, i) => (
              <button
                key={i}
                onClick={() => setLevelIdx(i)}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 border-2 transition-all text-left ${
                  levelIdx === i ? "border-amber-400 bg-amber-50" : "border-border bg-surface hover:border-amber-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-800 flex-shrink-0 ${levelIdx === i ? "bg-amber-500 text-white" : "bg-surface-2 text-text-muted"}`}>
                  {i + 1}
                </div>
                <div>
                  <p className={`text-sm font-700 ${levelIdx === i ? "text-amber-700" : "text-text"}`}>{l.label} — {l.category}</p>
                  <p className="text-xs text-text-muted">{l.desc}</p>
                </div>
                {levelIdx === i && (
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={startGameFull}
            className="w-full h-14 bg-amber-500 text-white rounded-2xl text-lg font-700 hover:bg-amber-600 active:scale-[0.98] transition-all shadow-md"
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
        gameName={`Categorias — ${cfg.category}`}
        score={Math.max(0, score)}
        timeElapsed={elapsed}
        errors={wrongHits}
        extraStats={[
          { label: "Acertos", value: `${correctHits}/${correctItems}` },
          { label: "Erraram",  value: String(wrongHits) },
        ]}
        notes={notes}
        onNotesChange={setNotes}
        onSave={() => { setSaved(true); setTimeout(() => navigate("patient-detail", patient.id), 1200); }}
        onDiscard={() => navigate("patient-detail", patient.id)}
        saved={saved}
      />
    );
  }

  const urgentTime = timeLeft <= Math.round(cfg.timeLimit * 0.25);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <GameHeader
        title={cfg.category}
        subtitle={`${patient.name.split(" ")[0]} · Toque nas palavras corretas`}
        leftStat={{ label: "Acertos", value: correctHits }}
        rightStat={{ label: "Tempo", value: `${timeLeft}s` }}
        progress={1 - timeLeft / cfg.timeLimit}
        progressColor={urgentTime ? "bg-error" : "bg-amber-400"}
        onBack={() => setPhase("instructions")}
      />

      <div className="flex-1 flex flex-col px-5 py-5 max-w-2xl mx-auto w-full">
        <div className="bg-surface rounded-2xl border-2 border-primary/20 p-4 mb-5 text-center">
          <p className="text-xs font-700 text-text-muted uppercase tracking-wider mb-1">Categoria</p>
          <h2 className="text-2xl font-800 text-primary">{cfg.category}</h2>
          <p className="text-xs text-text-muted mt-1">Toque em tudo que é <strong>{cfg.category.toLowerCase()}</strong></p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 content-start">
          {shuffledItems.map((item, i) => {
            const st = chipStates[i] ?? "neutral";
            const isShaking = shaking === i;
            return (
              <button
                key={i}
                onClick={() => handleChipTap(i)}
                disabled={st !== "neutral"}
                className={`
                  h-14 rounded-2xl text-base font-700 border-2 flex items-center justify-center gap-2 transition-all duration-150
                  ${isShaking ? "shake" : ""}
                  ${st === "correct"
                    ? "bg-accent/12 border-accent text-accent-dark cursor-default"
                    : st === "wrong"
                    ? "bg-error/8 border-error/30 text-text-light cursor-not-allowed opacity-60"
                    : "bg-surface border-border text-text hover:border-primary/40 hover:shadow-sm active:scale-[0.97]"
                  }
                `}
              >
                {st === "correct" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {st === "wrong" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D96B6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
                {item.word}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs font-600 text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            Correto: {correctHits}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
            Errado: {wrongHits}
          </span>
        </div>
      </div>
    </div>
  );
}
