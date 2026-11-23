import { useState } from "react";
import type { Navigate } from "../App";
import { api } from "../api/client";
import { podeGerenciar } from "../data";
import { useData } from "../state/DataContext";
import NavBar from "../components/NavBar";
import PatientForm from "../components/PatientForm";

interface Props { navigate: Navigate; selectedPatientId: string; }

/** Edição e arquivamento do cadastro da pessoa (responsável ou gestor). */
export default function PatientEdit({ navigate, selectedPatientId }: Props) {
  const { patients, carregando, recarregar } = useData();
  const patient = patients.find((p) => p.id === selectedPatientId);
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-base text-text-muted" role="status">{carregando ? "Carregando…" : "Pessoa não encontrada."}</p>
      </div>
    );
  }
  if (!podeGerenciar(patient)) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base text-text">Só o responsável pela pessoa pode editar o cadastro.</p>
        <button onClick={() => navigate("patient-detail", patient.id)} className="h-12 px-6 bg-primary text-white rounded-2xl text-base font-700">
          Voltar ao perfil
        </button>
      </div>
    );
  }

  async function arquivar() {
    setErro(null);
    try {
      await api(`/pacientes/${patient!.id}`, { method: "DELETE" });
      await recarregar();
      navigate("patients");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível arquivar.");
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("patient-detail", patient.id)} aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-xl font-800 text-white">Editar cadastro</h1>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <PatientForm
          inicial={{
            nome_completo: patient.name,
            data_nascimento: patient.birthDate,
            condicao: patient.condition,
            nivel_tecnologia: patient.techLevel,
            observacoes: patient.notes ?? null,
          }}
          rotuloEnviar="Salvar alterações"
          onEnviar={async (dados) => {
            await api(`/pacientes/${patient.id}`, { method: "PATCH", body: JSON.stringify(dados) });
            await recarregar();
            navigate("patient-detail", patient.id);
          }}
          rodape={
            <div className="mt-4 border-t border-border pt-4">
              <h2 className="text-base font-700 text-error">Arquivar cadastro</h2>
              <p className="text-sm text-text-muted mt-1">
                A pessoa sai das listas e ninguém mais a acompanha pelo Cogni. O histórico fica guardado.
              </p>
              {erro && <p role="alert" className="text-error text-sm font-600 mt-2">{erro}</p>}
              {!confirmar ? (
                <button type="button" onClick={() => setConfirmar(true)} className="mt-3 h-11 px-5 border-2 border-error/40 text-error rounded-2xl text-base font-700">
                  Arquivar
                </button>
              ) : (
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => void arquivar()} className="h-11 px-5 bg-error text-white rounded-2xl text-base font-700">
                    Confirmar arquivamento
                  </button>
                  <button type="button" onClick={() => setConfirmar(false)} className="h-11 px-5 border-2 border-border rounded-2xl text-base font-700 text-text">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          }
        />
      </main>

      <NavBar active="patients" navigate={navigate} />
    </div>
  );
}
