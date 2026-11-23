import { useCallback, useEffect, useState } from "react";
import { api, json } from "../api/client";
import type { Convite, PapelVinculo, Vinculo } from "../api/tipos";
import { PAPEIS, podeGerenciar, primeiroNome, type Patient } from "../data";

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

interface Props {
  patient: Patient;
  /** Chamado quando o próprio usuário deixa de acompanhar a pessoa. */
  onSaiu: () => void;
}

/** Quem acompanha a pessoa, com que papel, e convite de novos cuidadores. */
export default function CareTeam({ patient, onSaiu }: Props) {
  const gerencia = podeGerenciar(patient);
  const [vinculos, setVinculos] = useState<Vinculo[] | null>(null);
  const [papelConvite, setPapelConvite] = useState<PapelVinculo>("cuidador");
  const [convite, setConvite] = useState<Convite | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setVinculos(await api<Vinculo[]>(`/pacientes/${patient.id}/vinculos`));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar.");
    }
  }, [patient.id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function acao(fn: () => Promise<unknown>) {
    setErro(null);
    try {
      await fn();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    }
  }

  const gerarConvite = () =>
    acao(async () => setConvite(await api<Convite>(`/pacientes/${patient.id}/convites`, json({ papel: papelConvite }))));

  const mudarPapel = (v: Vinculo, papel: PapelVinculo) =>
    acao(() => api(`/pacientes/${patient.id}/vinculos/${v.cuidador_id}`, { method: "PATCH", body: JSON.stringify({ papel }) }));

  async function remover(v: Vinculo) {
    setErro(null);
    try {
      await api(`/pacientes/${patient.id}/vinculos/${v.cuidador_id}`, { method: "DELETE" });
      if (v.voce) onSaiu();
      else await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    }
  }

  return (
    <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
      <h2 className="text-base font-700 text-text">Quem acompanha {primeiroNome(patient.name)}</h2>
      <p className="text-sm text-text-muted mt-0.5">
        Seu papel: <strong className="text-text">{PAPEIS[patient.role].nome}</strong>. {PAPEIS[patient.role].descricao}
      </p>
      {patient.institution && <p className="text-sm text-text-muted mt-1">Pessoa do {patient.institution}.</p>}

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {(vinculos ?? []).map((v) => (
          <li key={v.cuidador_id} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="basis-full min-w-0">
              <p className="text-sm font-700 text-text">
                {v.nome}
                {v.voce && <span className="text-text-muted font-600"> (você)</span>}
              </p>
              {!gerencia && <p className="text-sm text-text-muted">{PAPEIS[v.papel].nome}</p>}
            </div>
            {gerencia ? (
              <select
                aria-label={`Papel de ${v.nome}`}
                value={v.papel}
                onChange={(e) => void mudarPapel(v, e.target.value as PapelVinculo)}
                className="h-10 px-2 flex-1 rounded-xl border-2 border-border bg-background text-sm"
              >
                <option value="responsavel">Responsável</option>
                <option value="cuidador">Cuidador</option>
                <option value="acompanhante">Acompanhante</option>
              </select>
            ) : null}
            {(gerencia || v.voce) && (
              <button
                onClick={() => void remover(v)}
                className="h-10 px-3 rounded-xl border-2 border-error/30 text-error text-sm font-700"
              >
                {v.voce ? "Sair" : "Remover"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {gerencia && (
        <div className="mt-3 bg-background rounded-xl p-3">
          <p className="text-sm font-700 text-text">Convidar outra pessoa</p>
          <p className="text-sm text-text-muted mt-0.5">
            Gere um código e passe para quem vai acompanhar. A pessoa digita o código em Minha conta. Vale por 7 dias e uma vez só.
          </p>
          <div className="mt-2 flex gap-2">
            <select
              aria-label="Papel do convidado"
              value={papelConvite}
              onChange={(e) => setPapelConvite(e.target.value as PapelVinculo)}
              className="h-11 px-2 flex-1 rounded-xl border-2 border-border bg-surface text-sm"
            >
              <option value="cuidador">Como cuidador</option>
              <option value="acompanhante">Como acompanhante</option>
              <option value="responsavel">Como responsável</option>
            </select>
            <button onClick={() => void gerarConvite()} className="h-11 px-4 bg-primary text-white rounded-xl text-sm font-700">
              Gerar código
            </button>
          </div>
          {convite && (
            <p className="mt-3 text-sm text-text" aria-live="polite">
              Código: <strong className="text-lg font-800 tracking-widest text-primary">{convite.codigo}</strong>
              <br />
              <span className="text-text-muted">
                {PAPEIS[convite.papel as PapelVinculo].nome} · válido até {dataCurta.format(new Date(convite.expira_em))}
              </span>
            </p>
          )}
        </div>
      )}
      {erro && <p role="alert" className="mt-2 text-error text-sm font-600">{erro}</p>}
    </section>
  );
}
