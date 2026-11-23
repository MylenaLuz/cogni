import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TERMO from "../legal/termo.json";
import { useAuth } from "../state/AuthContext";

/** Mostrada quando o termo mudou desde o último aceite: o uso só continua após o novo aceite. */
export default function NewTermsAcceptance() {
  const { aceitarTermo, sair, usuario } = useAuth();
  const ir = useNavigate();
  const [marcado, setMarcado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aceitar() {
    setEnviando(true);
    setErro(null);
    try {
      await aceitarTermo(TERMO.versao);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível registrar o aceite.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <header className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-800 text-white">O termo de uso foi atualizado</h1>
          <p className="text-white/80 text-sm mt-1">
            {usuario?.versao_termo ? `Você aceitou a versão ${usuario.versao_termo}. ` : ""}A versão atual é {TERMO.versao}.
          </p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4">
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-text leading-relaxed">
            {TERMO.resumo.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <a href="/termos" target="_blank" rel="noopener" className="inline-block mt-3 text-sm font-700 text-primary underline">
            Ler o termo completo
          </a>
        </div>
        <label className="flex items-start gap-3 text-sm text-text leading-snug">
          <input
            type="checkbox"
            checked={marcado}
            onChange={(e) => setMarcado(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-primary flex-shrink-0"
          />
          <span>Li e aceito a versão {TERMO.versao} do termo de uso e política de privacidade.</span>
        </label>
        {erro && <p role="alert" className="text-error text-sm font-600">{erro}</p>}
        <button
          onClick={() => void aceitar()}
          disabled={!marcado || enviando}
          className="h-12 bg-primary text-white rounded-2xl text-base font-700 disabled:opacity-60"
        >
          {enviando ? "Registrando…" : "Aceitar e continuar"}
        </button>
        <p className="text-sm text-text-muted">
          Se não concordar, você pode exportar seus dados e excluir a conta em Minha conta, ou apenas sair.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => ir("/conta")} className="h-12 border-2 border-border rounded-2xl text-base font-700 text-text">
            Minha conta
          </button>
          <button onClick={() => void sair()} className="h-12 border-2 border-border rounded-2xl text-base font-700 text-text">
            Sair
          </button>
        </div>
      </main>
    </div>
  );
}
