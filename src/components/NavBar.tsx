import { Navigate, Screen } from "../App";

interface Props {
  active: Screen;
  navigate: Navigate;
}

const tabs: { label: string; screen: Screen; icon: React.ReactNode }[] = [
  {
    label: "Início",
    screen: "dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Pacientes",
    screen: "patients",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Jogos",
    screen: "games",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="15.5" cy="11" r="0.5" fill="currentColor" /><circle cx="17.5" cy="13" r="0.5" fill="currentColor" />
        <rect x="2" y="6" width="20" height="12" rx="4" />
      </svg>
    ),
  },
  {
    label: "Relatórios",
    screen: "reports",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><polyline points="2 20 22 20" />
      </svg>
    ),
  },
  {
    label: "IA",
    screen: "ai-insights",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
        <path d="M12 10c4 0 8 2 8 5v1H4v-1c0-3 4-5 8-5" />
        <path d="M8 21l2-4h4l2 4" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function NavBar({ active, navigate }: Props) {
  return (
    <nav className="bg-surface border-t border-border flex items-stretch safe-bottom">
      {tabs.map((tab) => {
        const isActive = active === tab.screen;
        return (
          <button
            key={tab.screen}
            onClick={() => navigate(tab.screen)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-700 transition-colors ${
              isActive ? "text-primary" : "text-text-muted hover:text-text"
            }`}
          >
            <span className={isActive ? "text-primary" : "text-text-muted"}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
