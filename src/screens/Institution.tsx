import { useCallback, useEffect, useState } from "react";
import type { Navigate } from "../App";
import { api, json } from "../api/client";
import type { Convite, InstituicaoDetalhe, PapelInstituicao, PapelVinculo } from "../api/tipos";
import { PAPEIS } from "../data";
import { useAuth } from "../state/AuthContext";
import { useData } from "../state/DataContext";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/** Gestão da instituição: equipe, convites e quem acompanha cada pessoa. */
export default function Institution({ navigate }: Props) {
  const { usuario, recarregarUsuario } = useAuth();
  const { recarregar } = useData();
  const [inst, setInst] = useState<InstituicaoDetalhe | null>(null);
  const [papelConvite, setPapelConvite] = useState<PapelInstituicao>("profissional");
  const [convite, setConvite] = useState<Convite | null>(null);
  const [atribuir, setAtribuir] = useState<Record<string, { membro: string; papel: PapelVinculo }>>({});
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setInst(await api<InstituicaoDetalhe>("/instituicao"));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function acao(fn: () => Promise<unknown>) {
    setErro(null);
    try {
      await fn();
      await recarregarUsuario();
      await recarregar();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    }
  }

  if (!usuario?.instituicao) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base text-text">Você não faz parte de uma instituição.</p>
        <button onClick={() => navigate("account")} className="h-12 px-6 bg-primary text-white rounded-2xl text-base font-700">
          Ir para Minha conta
        </button>
      </div>
    );
  }

  const gestor = inst?.meu_papel === "gestor";
  const profissionais = (inst?.membros ?? []).filter((m) => !m.voce);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("account")} aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-800 text-white truncate">{usuario.instituicao.nome}</h1>
            <p className="text-white/80 text-sm">Você é {gestor ? "gestor" : "profissional da equipe"}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-4">
          <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
            <h2 className="text-base font-700 text-text">Equipe</h2>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {(inst?.membros ?? []).map((m) => (
                <li key={m.cuidador_id} className="py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-700 text-text truncate">
                      {m.nome}
                      {m.voce && <span className="text-text-muted font-600"> (você)</span>}
                    </p>
                    <p className="text-sm text-text-muted truncate">
                      {m.papel === "gestor" ? "Gestor" : "Profissional"} · {m.email}
                    </p>
                  </div>
                  {(gestor || m.voce) && (
                    <button
                      onClick={() => void acao(() => api(`/instituicao/membros/${m.cuidador_id}`, { method: "DELETE" }))}
                      className="h-10 px-3 rounded-xl border-2 border-error/30 text-error text-sm font-700"
                    >
                      {m.voce ? "Sair" : "Remover"}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {gestor && (
              <div className="mt-3 bg-background rounded-xl p-3">
                <p className="text-sm font-700 text-text">Convidar para a equipe</p>
                <p className="text-sm text-text-muted mt-0.5">
                  A pessoa cria a própria conta no Cogni e digita o código em Minha conta. Vale por 7 dias e uma vez só.
                </p>
                <div className="mt-2 flex gap-2">
                  <select
                    aria-label="Papel na equipe"
                    value={papelConvite}
                    onChange={(e) => setPapelConvite(e.target.value as PapelInstituicao)}
                    className="h-11 px-2 flex-1 rounded-xl border-2 border-border bg-surface text-sm"
                  >
                    <option value="profissional">Como profissional</option>
                    <option value="gestor">Como gestor</option>
                  </select>
                  <button
                    onClick={() => void acao(async () => setConvite(await api<Convite>("/instituicao/convites", json({ papel: papelConvite }))))}
                    className="h-11 px-4 bg-primary text-white rounded-xl text-sm font-700"
                  >
                    Gerar código
                  </button>
                </div>
                {convite && (
                  <p className="mt-3 text-sm text-text" aria-live="polite">
                    Código: <strong className="text-lg font-800 tracking-widest text-primary">{convite.codigo}</strong>
                    <br />
                    <span className="text-text-muted">Válido até {dataCurta.format(new Date(convite.expira_em))}</span>
                  </p>
                )}
              </div>
            )}
          </section>

          {gestor && (
            <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-700 text-text">Pessoas da instituição</h2>
                <button onClick={() => navigate("patient-new")} className="text-sm font-700 text-primary underline">
                  Cadastrar
                </button>
              </div>
              <p className="text-sm text-text-muted mt-0.5">Escolha quem da equipe acompanha cada pessoa.</p>
              <ul className="mt-2 flex flex-col gap-3">
                {(inst?.pessoas ?? []).map((p) => {
                  const sel = atribuir[p.id] ?? { membro: profissionais[0]?.cuidador_id ?? "", papel: "cuidador" as PapelVinculo };
                  return (
                    <li key={p.id} className="border border-border rounded-xl p-3">
                      <button onClick={() => navigate("patient-detail", p.id)} className="text-base font-700 text-primary underline text-left">
                        {p.nome}
                      </button>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {p.cuidadores.map((v) => (
                          <li key={v.cuidador_id} className="text-sm text-text flex items-center justify-between gap-2">
                            <span className="truncate">
                              {v.nome}
                              {v.voce ? " (você)" : ""} · {PAPEIS[v.papel].nome}
                            </span>
                            {!v.voce && (
                              <button
                                onClick={() => void acao(() => api(`/pacientes/${p.id}/vinculos/${v.cuidador_id}`, { method: "DELETE" }))}
                                className="text-sm font-700 text-error"
                              >
                                Remover
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      {profissionais.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <select
                            aria-label={`Profissional para ${p.nome}`}
                            value={sel.membro}
                            onChange={(e) => setAtribuir({ ...atribuir, [p.id]: { ...sel, membro: e.target.value } })}
                            className="h-10 px-2 flex-1 min-w-[8rem] rounded-xl border-2 border-border bg-background text-sm"
                          >
                            {profissionais.map((m) => (
                              <option key={m.cuidador_id} value={m.cuidador_id}>{m.nome}</option>
                            ))}
                          </select>
                          <select
                            aria-label="Papel"
                            value={sel.papel}
                            onChange={(e) => setAtribuir({ ...atribuir, [p.id]: { ...sel, papel: e.target.value as PapelVinculo } })}
                            className="h-10 px-2 rounded-xl border-2 border-border bg-background text-sm"
                          >
                            <option value="cuidador">Cuidador</option>
                            <option value="acompanhante">Acompanhante</option>
                            <option value="responsavel">Responsável</option>
                          </select>
                          <button
                            onClick={() =>
                              void acao(() => api(`/pacientes/${p.id}/vinculos`, json({ cuidador_id: sel.membro, papel: sel.papel })))
                            }
                            className="h-10 px-3 bg-primary text-white rounded-xl text-sm font-700"
                          >
                            Atribuir
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
                {inst && inst.pessoas.length === 0 && <li className="text-sm text-text-muted">Nenhuma pessoa cadastrada ainda.</li>}
              </ul>
            </section>
          )}

          {!gestor && inst && (
            <p className="text-sm text-text-muted">
              O gestor escolhe quais pessoas você acompanha. Elas aparecem no seu painel, com o papel que ele definiu.
            </p>
          )}
          {erro && <p role="alert" className="text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">{erro}</p>}
        </div>
      </main>

      <NavBar active="dashboard" navigate={navigate} />
    </div>
  );
}
