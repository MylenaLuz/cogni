import { useEffect, useRef, useState } from "react";
import type { Navigate } from "../../App";
import GameHeader from "../../components/GameHeader";
import GameResult from "../../components/GameResult";
import SemPessoa, { usePessoaDoJogo } from "../../components/SemPessoa";
import { useSalvarSessao } from "../../lib/useSalvarSessao";

interface Props { navigate: Navigate; selectedPatientId: string; }

type Phase = "instructions" | "game" | "result";

interface LevelConfig {
  label: string;
  desc: string;
  gridSize: number;
  duration: number;
  startInterval: number;
  intervalDecay: number;
}

const LEVELS: LevelConfig[] = [
  { label: "Básico",        desc: "Grade 3×3 · 30 s · ritmo lento",     gridSize: 3, duration: 30, startInterval: 2800, intervalDecay: 40 },
  { label: "Intermediário", desc: "Grade 3×3 · 25 s · ritmo médio",     gridSize: 3, duration: 25, startInterval: 2200, intervalDecay: 70 },
  { label: "Avançado",      desc: "Grade 4×4 · 20 s · ritmo acelerado", gridSize: 4, duration: 20, startInterval: 1600, intervalDecay: 100 },
];

function newTarget(current: number, total: number) {
  let n = current;
  while (n === current) n = Math.floor(Math.random() * total);
  return n;
}

export default function AttentionSpeed({ navigate, selectedPatientId }: Props) {
  const { pessoa: patient, carregando } = usePessoaDoJogo(selectedPatientId);
  const sessao = useSalvarSessao("atencao", patient?.id, navigate);
  const [phase, setPhase] = useState<Phase>("instructions");
  const [level, setLevel] = useState(0);
  const cfg = LEVELS[level];

  const [targetIdx, setTargetIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState(false);
  // Momento (ms da sessão) em que o alvo atual apareceu, para medir o tempo de reação.
  const estimuloEm = useRef(0);

  const totalCells = cfg.gridSize * cfg.gridSize;
  const interval = Math.max(600, cfg.startInterval - hits * cfg.intervalDecay);

  function mostrarAlvo(idx: number) {
    estimuloEm.current = sessao.agora();
    sessao.registrar({ tipo: "estimulo", alvo: String(idx) });
    setTargetIdx(idx);
  }

  // Contagem regressiva
  useEffect(() => {
    if (phase !== "game") return;
    const t = setInterval(() => {
      setTimeLeft((tl) => (tl <= 1 ? 0 : tl - 1));
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "game" && timeLeft === 0) {
      sessao.encerrar();
      setPhase("result");
    }
  }, [phase, timeLeft, sessao]);

  // O alvo muda de lugar sozinho: conta como omissão.
  useEffect(() => {
    if (phase !== "game") return;
    const t = setTimeout(() => {
      sessao.registrar({ tipo: "omissao", alvo: String(targetIdx) });
      setMisses((m) => m + 1);
      mostrarAlvo(newTarget(targetIdx, totalCells));
    }, interval);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetIdx, hits, totalCells, interval]);

  function startGame() {
    const total = LEVELS[level].gridSize ** 2;
    sessao.iniciar();
    setHits(0);
    setErrors(0);
    setMisses(0);
    setTimeLeft(LEVELS[level].duration);
    setElapsed(0);
    setFlash(false);
    mostrarAlvo(Math.floor(Math.random() * total));
    setPhase("game");
  }

  function handleCellTap(idx: number) {
    if (idx !== targetIdx) {
      sessao.registrar({ tipo: "toque", alvo: String(idx), correto: false });
      setErrors((e) => e + 1);
      return;
    }
    const reacao = Math.round(sessao.agora() - estimuloEm.current);
    sessao.registrar({ tipo: "toque", alvo: String(idx), correto: true, reacao_ms: reacao });
    setHits((h) => h + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
    mostrarAlvo(newTarget(idx, totalCells));
  }

  if (!patient) return <SemPessoa navigate={navigate} carregando={carregando} />;

  if (phase === "instructions") {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6 fade-in">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2C7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="text-center px-2">
            <h1 className="text-2xl font-800 text-text">Velocidade de Atenção</h1>
            <p className="text-text-muted text-base mt-2 leading-relaxed">
              Toque na estrela assim que ela aparecer — ela muda de lugar a cada acerto!
            </p>
          </div>

          <div className="w-full flex flex-col gap-2">
            <p className="text-xs font-700 text-text-muted uppercase tracking-wide">Selecione o nível</p>
            {LEVELS.map((l, i) => (
              <button
                key={i}
                onClick={() => setLevel(i)}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 border-2 transition-all text-left ${
                  level === i ? "border-primary bg-primary/8" : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-800 flex-shrink-0 ${level === i ? "bg-primary text-white" : "bg-surface-2 text-text-muted"}`}>
                  {i + 1}
                </div>
                <div>
                  <p className={`text-sm font-700 ${level === i ? "text-primary" : "text-text"}`}>{l.label}</p>
                  <p className="text-xs text-text-muted">{l.desc}</p>
                </div>
                {level === i && (
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C7A7A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full h-14 bg-primary text-white rounded-2xl text-lg font-700 hover:bg-primary-light active:scale-[0.98] transition-all shadow-md"
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
        gameName="Velocidade de Atenção"
        score={sessao.score}
        timeElapsed={elapsed}
        errors={errors}
        extraStats={[
          { label: "Acertos", value: String(hits) },
          { label: "Não tocadas", value: String(misses) },
          { label: "Nível", value: LEVELS[level].label },
        ]}
        notes={sessao.notes}
        onNotesChange={sessao.setNotes}
        onSave={() => void sessao.salvar(level + 1, { grade: cfg.gridSize, duracao_s: cfg.duration })}
        onDiscard={() => navigate("patient-detail", patient.id)}
        saved={sessao.saved}
        saving={sessao.saving}
        saveError={sessao.erro}
      />
    );
  }

  const cols = cfg.gridSize === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="min-h-full bg-background flex flex-col">
      <GameHeader
        title="Velocidade de Atenção"
        subtitle={`${patient.name.split(" ")[0]} · ${LEVELS[level].label}`}
        leftStat={{ label: "Acertos", value: hits }}
        rightStat={{ label: "Tempo", value: `${timeLeft}s` }}
        progress={1 - timeLeft / cfg.duration}
        progressColor={timeLeft <= 8 ? "bg-error" : "bg-accent"}
        onBack={() => setPhase("instructions")}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <p className="text-text-muted text-sm font-600 mb-6 text-center">
          Toque na estrela o mais rápido que conseguir!
        </p>
        <div className={`grid ${cols} gap-3 w-full max-w-xs`}>
          {Array.from({ length: totalCells }, (_, i) => {
            const isTarget = i === targetIdx;
            return (
              <button
                key={i}
                onClick={() => handleCellTap(i)}
                aria-label={isTarget ? "Estrela" : `Casa ${i + 1}`}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-100 active:scale-90 ${
                  isTarget
                    ? flash
                      ? "bg-accent border-accent"
                      : "bg-primary/10 border-primary shadow-md"
                    : "bg-surface border-border hover:bg-surface-2"
                }`}
              >
                {isTarget && (
                  <div className={`rounded-full flex items-center justify-center transition-colors ${cfg.gridSize === 4 ? "w-9 h-9" : "w-12 h-12"} ${flash ? "bg-accent" : "bg-primary"}`}>
                    <svg width={cfg.gridSize === 4 ? 18 : 22} height={cfg.gridSize === 4 ? 18 : 22} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-text-light text-xs mt-6 text-center">Ritmo aumenta a cada acerto</p>
      </div>
    </div>
  );
}
