import type { Navigate } from "../App";
import { useAuth } from "../state/AuthContext";
import { useData } from "../state/DataContext";
import NavBar from "../components/NavBar";
import PatientForm from "../components/PatientForm";

interface Props { navigate: Navigate; selectedPatientId: string; }

export default function PatientNew({ navigate }: Props) {
  const { criarPessoa } = useData();
  const { usuario } = useAuth();
  const gestor = usuario?.instituicao?.papel === "gestor";

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("patients")} aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-800 text-white">Nova pessoa</h1>
            <p className="text-white/80 text-sm">
              {gestor ? `Será cadastrada em ${usuario?.instituicao?.nome}` : "Você será o responsável pelo cadastro"}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <PatientForm
          rotuloEnviar="Cadastrar"
          onEnviar={async (dados) => {
            const p = await criarPessoa(dados);
            navigate("patient-detail", p.id);
          }}
        />
      </main>

      <NavBar active="patients" navigate={navigate} />
    </div>
  );
}
