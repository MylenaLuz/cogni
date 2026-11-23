import { useCallback, useRef, useState } from "react";
import type { Jogo, SessaoEntrada } from "../api/tipos";
import type { Navigate } from "../App";
import { useData } from "../state/DataContext";
import { pontuacaoPrevia } from "./pontuacao";
import { useSessionRecorder } from "./useSessionRecorder";

/** Grava os eventos de um jogo e salva a sessão na API. */
export function useSalvarSessao(jogo: Jogo, pacienteId: string | undefined, navigate: Navigate) {
  const rec = useSessionRecorder();
  const { salvarSessao } = useData();
  const final = useRef<Pick<SessaoEntrada, "iniciada_em" | "finalizada_em" | "eventos"> | null>(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const iniciar = useCallback(() => {
    rec.iniciar();
    final.current = null;
    setNotes("");
    setSaved(false);
    setErro(null);
  }, [rec]);

  /** Chamar quando o jogo termina: fixa o horário de fim e calcula a prévia da pontuação. */
  const encerrar = useCallback(
    (contexto: Record<string, unknown> = {}) => {
      final.current = rec.finalizar();
      setScore(pontuacaoPrevia(jogo, final.current.eventos, contexto));
    },
    [rec, jogo],
  );

  const salvar = useCallback(
    async (nivel: number, contexto: Record<string, unknown> = {}) => {
      if (!pacienteId || saving || saved) return;
      setSaving(true);
      setErro(null);
      try {
        const dados = final.current ?? rec.finalizar();
        const s = await salvarSessao(pacienteId, {
          ...dados,
          jogo,
          nivel,
          observacoes: notes.trim() || null,
          contexto: {
            ...contexto,
            tela: { largura: window.innerWidth, altura: window.innerHeight },
            hora_local: new Date(dados.iniciada_em).getHours(),
          },
        });
        setScore(s.score);
        setSaved(true);
        setTimeout(() => navigate("patient-detail", pacienteId), 1300);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar a sessão.");
      } finally {
        setSaving(false);
      }
    },
    [pacienteId, saving, saved, rec, salvarSessao, jogo, notes, navigate],
  );

  return { ...rec, iniciar, encerrar, salvar, notes, setNotes, saved, saving, erro, score };
}
