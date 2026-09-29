import { useState } from "react";
import Login from "./screens/Login";
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

  const navigate: Navigate = (s, patientId) => {
    if (patientId) setSelectedPatientId(patientId);
    setScreen(s);
  };

  const props = { navigate, selectedPatientId };

  const screens: Record<Screen, React.ReactNode> = {
    login: <Login navigate={navigate} />,
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
