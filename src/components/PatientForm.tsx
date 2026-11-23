import { useState, type FormEvent, type ReactNode } from "react";
import type { IdosoEntrada } from "../api/tipos";

const campo =
  "w-full h-12 px-4 rounded-xl border-2 border-border bg-surface text-text text-base focus:outline-none focus:border-primary transition-colors";

interface Props {
  inicial?: Partial<IdosoEntrada>;
  rotuloEnviar: string;
  onEnviar: (dados: IdosoEntrada) => Promise<void>;
  /** Conteúdo extra abaixo do botão principal (ex.: arquivar). */
  rodape?: ReactNode;
}

/** Formulário da pessoa acompanhada, usado no cadastro e na edição. */
export default function PatientForm({ inicial = {}, rotuloEnviar, onEnviar, rodape }: Props) {
  const [nome, setNome] = useState(inicial.nome_completo ?? "");
  const [nascimento, setNascimento] = useState(inicial.data_nascimento ?? "");
  const [condicao, setCondicao] = useState(inicial.condicao ?? "");
  const [tecnologia, setTecnologia] = useState(inicial.nivel_tecnologia ?? "");
  const [observacoes, setObservacoes] = useState(inicial.observacoes ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) {
      setErro("Informe o nome da pessoa.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await onEnviar({
        nome_completo: nome.trim(),
        data_nascimento: nascimento || null,
        condicao: condicao.trim() || null,
        nivel_tecnologia: tecnologia || null,
        observacoes: observacoes.trim() || null,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="nome" className="block text-sm font-700 text-text mb-1.5">Nome completo *</label>
        <input id="nome" className={campo} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" required />
      </div>
      <div>
        <label htmlFor="nascimento" className="block text-sm font-700 text-text mb-1.5">Data de nascimento</label>
        <input id="nascimento" type="date" className={campo} value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
      </div>
      <div>
        <label htmlFor="condicao" className="block text-sm font-700 text-text mb-1.5">Condição informada pela família ou equipe</label>
        <input id="condicao" className={campo} value={condicao} onChange={(e) => setCondicao(e.target.value)} placeholder="Opcional" />
      </div>
      <div>
        <label htmlFor="tecnologia" className="block text-sm font-700 text-text mb-1.5">Familiaridade com celular ou tablet</label>
        <select id="tecnologia" className={campo} value={tecnologia} onChange={(e) => setTecnologia(e.target.value)}>
          <option value="">Não informado</option>
          <option value="Alta">Usa smartphone sozinho</option>
          <option value="Média">Precisa de ajuda ocasional</option>
          <option value="Baixa">Dificuldade motora ou visual</option>
        </select>
      </div>
      <div>
        <label htmlFor="obs" className="block text-sm font-700 text-text mb-1.5">Sobre a pessoa</label>
        <textarea
          id="obs"
          rows={3}
          className={`${campo} h-auto py-3 resize-none`}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Preferências, rotina, cuidados"
        />
      </div>

      <p className="text-sm text-text-muted">
        Guarde só o necessário. Os dados ficam no servidor do Cogni e podem ser exportados ou apagados a qualquer momento.
      </p>

      {erro && <p role="alert" className="text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">{erro}</p>}

      <button type="submit" disabled={enviando} className="w-full h-12 bg-primary text-white rounded-2xl text-base font-700 hover:bg-primary-light disabled:opacity-70 transition-all shadow-md">
        {enviando ? "Salvando…" : rotuloEnviar}
      </button>
      {rodape}
    </form>
  );
}
