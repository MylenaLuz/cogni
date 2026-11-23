import { useState, type FormEvent } from "react";
import type { Navigate } from "../App";
import { useData } from "../state/DataContext";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const campo =
  "w-full h-12 px-4 rounded-xl border-2 border-border bg-surface text-text text-base focus:outline-none focus:border-primary transition-colors";

export default function PatientNew({ navigate }: Props) {
  const { criarPessoa } = useData();
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [condicao, setCondicao] = useState("");
  const [tecnologia, setTecnologia] = useState("");
  const [observacoes, setObservacoes] = useState("");
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
      const p = await criarPessoa({
        nome_completo: nome.trim(),
        data_nascimento: nascimento || null,
        condicao: condicao.trim() || null,
        nivel_tecnologia: tecnologia || null,
        observacoes: observacoes.trim() || null,
      });
      navigate("patient-detail", p.id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível cadastrar.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("patients")} aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-xl font-800 text-white">Nova pessoa</h1>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
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
              <option value="baixo">Pouca</option>
              <option value="medio">Alguma</option>
              <option value="alto">Muita</option>
            </select>
          </div>
          <div>
            <label htmlFor="obs" className="block text-sm font-700 text-text mb-1.5">Observações</label>
            <textarea id="obs" rows={3} className={`${campo} h-auto py-3 resize-none`} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          <p className="text-sm text-text-muted">
            Guarde só o necessário. Os dados ficam no servidor do Cogni e podem ser exportados ou apagados a qualquer momento.
          </p>

          {erro && <p role="alert" className="text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">{erro}</p>}

          <button type="submit" disabled={enviando} className="w-full h-12 bg-primary text-white rounded-2xl text-base font-700 hover:bg-primary-light disabled:opacity-70 transition-all shadow-md">
            {enviando ? "Salvando…" : "Cadastrar"}
          </button>
        </form>
      </main>

      <NavBar active="patients" navigate={navigate} />
    </div>
  );
}
