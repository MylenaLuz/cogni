import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import Dashboard from "./screens/Dashboard";
import Patients from "./screens/Patients";
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
  | "patient-detail"
  | "games"
  | "game-session"
  | "game-attention"
  | "game-pairs"
  | "game-categories"
  | "reports"
  | "ai-insights";

export type Navigate = (screen: Screen, patientId?: string) => void;

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");

  // Este Hook verifica a URL para ver se estamos voltando de um link de e-mail do Supabase
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    
    if (path === '/reset-password' || hash.includes('type=recovery')) {
      setScreen("reset-password");
    }

    // Escuta eventos automáticos de recuperação disparados pelo Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setScreen("reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate: Navigate = (s, patientId) => {
    if (patientId) setSelectedPatientId(patientId);
    setScreen(s);
  };

  const props = { navigate, selectedPatientId };

  const screens: Record<Screen, React.ReactNode> = {
    login: <Login navigate={navigate} />,
    signup: <Signup navigate={navigate} />,
    "forgot-password": <ForgotPassword navigate={navigate} />,
    "reset-password": <ResetPassword navigate={navigate} />,
    dashboard: <Dashboard {...props} />,
    patients: <Patients {...props} />,
    "patient-detail": <PatientDetail {...props} />,
    games: <Games {...props} />,
    "game-session": <GameSession {...props} />,
    "game-attention": <AttentionSpeed {...props} />,
    "game-pairs": <MemoryPairs {...props} />,
    "game-categories": <Categories {...props} />,
    reports: <Reports {...props} />,
    "ai-insights": <AIInsights {...props} />,
  };

  return (
    <div className="size-full bg-background">
      {screens[screen]}
    </div>
  );
}