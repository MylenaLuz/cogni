import { createContext, useCallback, useContext, useState, type ComponentType, type ReactNode } from "react";
import { BrowserRouter, Navigate as Redirect, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { DataProvider } from "./state/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import Dashboard from "./screens/Dashboard";
import Patients from "./screens/Patients";
import PatientNew from "./screens/PatientNew";
import PatientDetail from "./screens/PatientDetail";
import Games from "./screens/Games";
import GameSession from "./screens/GameSession";
import AttentionSpeed from "./screens/games/AttentionSpeed";
import MemoryPairs from "./screens/games/MemoryPairs";
import Categories from "./screens/games/Categories";
import Reports from "./screens/Reports";
import AIInsights from "./screens/AIInsights";

export type Screen =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "dashboard"
  | "patients"
  | "patient-new"
  | "patient-detail"
  | "games"
  | "game-session"
  | "game-attention"
  | "game-pairs"
  | "game-categories"
  | "reports"
  | "ai-insights";

export type Navigate = (screen: Screen, patientId?: string) => void;

const CAMINHOS: Record<Screen, string> = {
  login: "/entrar",
  signup: "/cadastro",
  "forgot-password": "/esqueci-senha",
  "reset-password": "/redefinir-senha",
  dashboard: "/",
  patients: "/pessoas",
  "patient-new": "/pessoas/nova",
  "patient-detail": "/pessoas",
  games: "/jogos",
  "game-session": "/jogos/imagens",
  "game-attention": "/jogos/atencao",
  "game-pairs": "/jogos/pares",
  "game-categories": "/jogos/categorias",
  reports: "/relatorios",
  "ai-insights": "/insights",
};

// Pessoa ativa: escolhida no perfil ou no catálogo de jogos; lembrada neste navegador.
const CHAVE = "cogni.pessoaAtiva";
const PessoaCtx = createContext<{ pessoa: string; setPessoa: (id: string) => void }>({ pessoa: "", setPessoa: () => {} });

function lerPessoa(): string {
  try {
    return localStorage.getItem(CHAVE) ?? "";
  } catch {
    return "";
  }
}

function PessoaProvider({ children }: { children: ReactNode }) {
  const [pessoa, set] = useState(lerPessoa);
  const setPessoa = useCallback((id: string) => {
    set(id);
    try {
      localStorage.setItem(CHAVE, id);
    } catch {
      /* armazenamento indisponível */
    }
  }, []);
  return <PessoaCtx.Provider value={{ pessoa, setPessoa }}>{children}</PessoaCtx.Provider>;
}

function useNavegar(): Navigate {
  const nav = useNavigate();
  const { pessoa, setPessoa } = useContext(PessoaCtx);
  return useCallback(
    (tela, id) => {
      if (id) setPessoa(id);
      if (tela === "patient-detail") nav(`/pessoas/${id ?? pessoa}`);
      else nav(CAMINHOS[tela]);
    },
    [nav, pessoa, setPessoa],
  );
}

interface TelaProps {
  navigate: Navigate;
  selectedPatientId: string;
}

function Tela({ C }: { C: ComponentType<TelaProps> }) {
  const navigate = useNavegar();
  const { id } = useParams();
  const { pessoa } = useContext(PessoaCtx);
  return <C navigate={navigate} selectedPatientId={id ?? pessoa} />;
}

function Carregando() {
  return (
    <div className="min-h-full flex items-center justify-center bg-background">
      <p className="text-text-muted text-base" role="status">Carregando…</p>
    </div>
  );
}

function Privado() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Carregando />;
  if (!usuario) return <Redirect to="/entrar" replace />;
  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  );
}

function Publico() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Carregando />;
  if (usuario) return <Redirect to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <PessoaProvider>
            <div className="size-full bg-background">
              <Routes>
                <Route element={<Publico />}>
                  <Route path="/entrar" element={<Tela C={Login} />} />
                  <Route path="/cadastro" element={<Tela C={Signup} />} />
                  <Route path="/esqueci-senha" element={<Tela C={ForgotPassword} />} />
                </Route>
                <Route path="/redefinir-senha" element={<Tela C={ResetPassword} />} />
                <Route element={<Privado />}>
                  <Route path="/" element={<Tela C={Dashboard} />} />
                  <Route path="/pessoas" element={<Tela C={Patients} />} />
                  <Route path="/pessoas/nova" element={<Tela C={PatientNew} />} />
                  <Route path="/pessoas/:id" element={<Tela C={PatientDetail} />} />
                  <Route path="/jogos" element={<Tela C={Games} />} />
                  <Route path="/jogos/imagens" element={<Tela C={GameSession} />} />
                  <Route path="/jogos/atencao" element={<Tela C={AttentionSpeed} />} />
                  <Route path="/jogos/pares" element={<Tela C={MemoryPairs} />} />
                  <Route path="/jogos/categorias" element={<Tela C={Categories} />} />
                  <Route path="/relatorios" element={<Tela C={Reports} />} />
                  <Route path="/insights" element={<Tela C={AIInsights} />} />
                </Route>
                <Route path="*" element={<Redirect to="/" replace />} />
              </Routes>
            </div>
          </PessoaProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
