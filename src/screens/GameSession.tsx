import { useEffect, useRef, useState } from "react";
import type { Navigate } from "../App";
import GameResult, { fmt } from "../components/GameResult";
import SemPessoa, { usePessoaDoJogo } from "../components/SemPessoa";
import { shuffle } from "../lib/shuffle";
import { useSalvarSessao } from "../lib/useSalvarSessao";

interface Props { navigate: Navigate; selectedPatientId: string; }

interface Par { id: number; emoji: string; word: string; }

const BANCO: Par[] = [
  { id: 1, emoji: "🌷", word: "Flor" },
  { id: 2, emoji: "🐕", word: "Cachorro" },
  { id: 3, emoji: "☀️", word: "Sol" },
  { id: 4, emoji: "🌊", word: "Mar" },
  { id: 5, emoji: "🍞", word: "Pão" },
  { id: 6, emoji: "🏠", word: "Casa" },
  { id: 7, emoji: "🐈", word: "Gato" },
  { id: 8, emoji: "☂️", word: "Guarda-chuva" },
];

const NIVEIS = [
  { label: "Básico", desc: "2 pares", pares: 2 },
  { label: "Intermediário", desc: "4 pares", pares: 4 },
  { label: "Avançado", desc: "6 pares", pares: 6 },
] as const;

export default function GameSession({ navigate, selectedPatientId }: Props) {
  const { pessoa: patient, carregando } = usePessoaDoJogo(selectedPatientId);
  const sessao = useSalvarSessao("imagens", patient?.id, navigate);
  const [level, setLevel] = useState<1 | 2 | 3 | null>(null);
  const [pairs, setPairs] = useState<Par[]>([]);
  const [words, setWords] = useState<Par[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongWord, setWrongWord] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const escolhaEm = useRef(0);

  useEffect(() => {
    if (level === null || done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [level, done]);

  useEffect(() => {
    if (level !== null && pairs.length > 0 && matched.length === pairs.length && !done) {
      sessao.encerrar();
      const t = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, pairs, level, done]);

  function comecar(l: 1 | 2 | 3) {
    const escolhidos = shuffle(BANCO).slice(0, NIVEIS[l - 1].pares);
    setPairs(escolhidos);
    setWords(shuffle(escolhidos));
    setMatched([]);
    setErrors(0);
    setSelectedImage(null);
    setWrongWord(null);
    setElapsed(0);
    setDone(false);
    sessao.iniciar();
    setLevel(l);
  }

  function handleImageClick(id: number) {
    if (matched.includes(id)) return;
    setSelectedImage(id === selectedImage ? null : id);
    escolhaEm.current = sessao.agora();
    setWrongWord(null);
  }

  function handleWordClick(id: number) {
    if (matched.includes(id) || selectedImage === null) return;
    const certo = selectedImage === id;
    sessao.registrar({
      tipo: "tentativa",
      alvo: String(selectedImage),
      correto: certo,
      reacao_ms: Math.round(sessao.agora() - escolhaEm.current),
      dados: { palavra: id },
    });
    if (certo) {
      setMatched((m) => [...m, id]);
      setSelectedImage(null);
    } else {
      setErrors((e) => e + 1);
      setWrongWord(id);
      setTimeout(() => { setWrongWord(null); setSelectedImage(null); }, 700);
    }
  }

  if (!patient) return <SemPessoa navigate={navigate} carregando={carregando} />;

  if (!level) {
    return (
      <div className="min-h-full bg-background flex flex-col">
        <div className="bg-primary px-5 pt-10 pb-5">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate("games")} aria-label="Voltar aos jogos" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-800 text-white">Associação de Imagens</h1>
              <p className="text-white/80 text-sm">{patient.name}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="max-w-sm w-full">
            <h2 className="text-lg font-700 text-text mb-1">Selecione o nível</h2>
            <p className="text-sm text-text-muted mb-5">Ligue cada imagem à palavra certa. Mantenha o mesmo nível entre as sessões para comparar.</p>
            <div className="flex flex-col gap-3">
              {([1, 2, 3] as const).map((l) => (
                <button key={l} onClick={() => comecar(l)} className="w-full bg-surface border-2 border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary hover:shadow-md active:scale-[0.98] transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-800 text-primary flex-shrink-0">{l}</div>
                  <div>
                    <p className="text-base font-700 text-text">{NIVEIS[l - 1].label}</p>
                    <p className="text-sm text-text-muted">{NIVEIS[l - 1].desc}</p>
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
    return (
      <GameResult
        patientName={patient.name}
        gameName="Associação de Imagens"
        score={sessao.score}
        timeElapsed={elapsed}
        errors={errors}
        extraStats={[
          { label: "Pares", value: `${matched.length}/${pairs.length}` },
          { label: "Nível", value: NIVEIS[level - 1].label },
        ]}
        notes={sessao.notes}
        onNotesChange={sessao.setNotes}
        onSave={() => void sessao.salvar(level, { pares: pairs.length })}
        onDiscard={() => navigate("patient-detail", patient.id)}
        saved={sessao.saved}
        saving={sessao.saving}
        saveError={sessao.erro}
      />
    );
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setLevel(null)} aria-label="Voltar à escolha de nível" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="flex-1">
              <h1 className="text-white text-base font-800">Associação de Imagens — Nível {level}</h1>
              <p className="text-white/80 text-sm">{patient.name} · {fmt(elapsed)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(matched.length / pairs.length) * 100}%` }} />
            </div>
            <span className="text-white text-sm font-600">{matched.length}/{pairs.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 max-w-sm mx-auto w-full flex flex-col">
        <p className="text-text-muted text-base text-center mb-5 font-500">Toque em uma imagem e depois na palavra dela</p>
        <div className="grid grid-cols-2 gap-5 flex-1">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted font-700 uppercase tracking-wider text-center">Imagens</p>
            {pairs.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isSelected = selectedImage === pair.id;
              return (
                <button key={pair.id} onClick={() => handleImageClick(pair.id)} disabled={isMatched}
                  aria-label={isMatched ? `${pair.word}, já ligada` : `Imagem ${pair.word}`} aria-pressed={isSelected}
                  className={`h-16 rounded-2xl text-3xl flex items-center justify-center border-3 transition-all duration-200
                    ${isMatched ? "bg-accent/12 border-accent cursor-default" : isSelected ? "bg-primary/10 border-primary scale-[1.03] shadow-md" : "bg-surface border-border hover:border-primary/40 active:scale-[0.97]"}`}>
                  {isMatched ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D8A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : pair.emoji}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted font-700 uppercase tracking-wider text-center">Palavras</p>
            {words.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isWrong = wrongWord === pair.id;
              return (
                <button key={pair.id} onClick={() => handleWordClick(pair.id)} disabled={isMatched}
                  className={`h-16 rounded-2xl text-base font-700 flex items-center justify-center border-3 transition-all duration-200 px-2
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
