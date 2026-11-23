import { useState } from "react";
import type { Navigate } from "../App";
import { api } from "../api/client";
import TERMO from "../legal/termo.json";
import { useAuth } from "../state/AuthContext";
import Avatar from "../components/Avatar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

function baixarJson(nome: string, dados: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

/** Minha conta: dados do cuidador, termo aceito e direitos do titular (exportar e excluir). */
export default function Account({ navigate }: Props) {
  const { usuario, sair, excluirConta } = useAuth();
  const [exportando, setExportando] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [abrirExclusao, setAbrirExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!usuario) return null;
  const termoAtual = usuario.versao_termo === TERMO.versao;

  async function exportar() {
    setExportando(true);
    setErro(null);
    try {
      const dados = await api<unknown>("/conta/exportar");
      baixarJson(`cogni-meus-dados-${new Date().toISOString().slice(0, 10)}.json`, dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível exportar.");
    } finally {
      setExportando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await excluirConta();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível excluir a conta.");
      setExcluindo(false);
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {termoAtual && (
            <button onClick={() => navigate("dashboard")} aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <h1 className="text-xl font-800 text-white">Minha conta</h1>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4">
          <section className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
            <Avatar name={usuario.nome_completo} />
            <div className="min-w-0">
              <p className="text-base font-700 text-text truncate">{usuario.nome_completo}</p>
              <p className="text-sm text-text-muted truncate">{usuario.email}</p>
              {usuario.tipo_vinculo && <p className="text-sm text-text-muted">{usuario.tipo_vinculo}</p>}
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text">Termo de uso e privacidade</h2>
            <p className="text-sm text-text-muted mt-1">
              {usuario.versao_termo
                ? `Você aceitou a versão ${usuario.versao_termo}${usuario.termo_aceito_em ? ` em ${dataHora.format(new Date(usuario.termo_aceito_em))}` : ""}.`
                : "Nenhum aceite registrado."}
              {!termoAtual && ` A versão atual é ${TERMO.versao}.`}
            </p>
            <button onClick={() => navigate("terms")} className="mt-3 text-sm font-700 text-primary underline">
              Ler o termo completo
            </button>
          </section>

          <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text">Seus dados</h2>
            <p className="text-sm text-text-muted mt-1">
              Baixe tudo o que o Cogni guarda da sua conta: seus dados, as pessoas acompanhadas e todas as sessões, com cada
              evento dos jogos, em um arquivo JSON.
            </p>
            <button
              onClick={() => void exportar()}
              disabled={exportando}
              className="mt-3 h-11 px-5 bg-primary text-white rounded-2xl text-base font-700 disabled:opacity-70"
            >
              {exportando ? "Preparando…" : "Exportar meus dados"}
            </button>
          </section>

          <section className="bg-surface rounded-2xl border border-error/30 shadow-sm p-4">
            <h2 className="text-base font-700 text-error">Excluir conta</h2>
            <p className="text-sm text-text-muted mt-1">
              Apaga sua conta e as pessoas acompanhadas que não têm outro cuidador, com todas as sessões. Não dá para desfazer.
              As cópias de segurança são substituídas em até 7 dias.
            </p>
            {!abrirExclusao ? (
              <button onClick={() => setAbrirExclusao(true)} className="mt-3 h-11 px-5 border-2 border-error/40 text-error rounded-2xl text-base font-700">
                Quero excluir minha conta
              </button>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <label htmlFor="confirmar-exclusao" className="text-sm text-text">
                  Para confirmar, digite <strong>EXCLUIR</strong>:
                </label>
                <input
                  id="confirmar-exclusao"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="off"
                  className="h-12 px-4 rounded-xl border-2 border-border bg-background text-base focus:outline-none focus:border-error"
                />
                <button
                  onClick={() => void excluir()}
                  disabled={confirmacao.trim().toUpperCase() !== "EXCLUIR" || excluindo}
                  className="h-11 px-5 bg-error text-white rounded-2xl text-base font-700 disabled:opacity-50"
                >
                  {excluindo ? "Excluindo…" : "Excluir definitivamente"}
                </button>
              </div>
            )}
          </section>

          {erro && <p role="alert" className="text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">{erro}</p>}

          <button onClick={() => void sair()} className="h-12 border-2 border-border rounded-2xl text-base font-700 text-text mb-4">
            Sair
          </button>
        </div>
      </main>
    </div>
  );
}
