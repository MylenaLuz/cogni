import type { Navigate } from "../App";
import { useData } from "../state/DataContext";
import type { Patient } from "../data";

/** Pessoa escolhida para a sessão de jogo (ou undefined, se nenhuma). */
export function usePessoaDoJogo(id: string): { pessoa: Patient | undefined; carregando: boolean } {
  const { patients, carregando } = useData();
  return { pessoa: patients.find((p) => p.id === id), carregando };
}

/** Tela mostrada quando um jogo é aberto sem uma pessoa escolhida. */
export default function SemPessoa({ navigate, carregando }: { navigate: Navigate; carregando?: boolean }) {
  if (carregando) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <p className="text-text-muted text-base" role="status">Carregando…</p>
      </div>
    );
  }
  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-800 text-text">Para quem é esta sessão?</h1>
      <p className="text-base text-text-muted max-w-sm">
        Escolha uma pessoa antes de começar. Cada sessão fica no histórico dela e é comparada só com ela mesma.
      </p>
      <button
        onClick={() => navigate("patients")}
        className="h-12 px-6 bg-primary text-white rounded-2xl text-base font-700"
      >
        Escolher pessoa
      </button>
    </div>
  );
}
