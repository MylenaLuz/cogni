import { Navigate, Screen } from "../App";
import { mockPatients } from "../data";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const games: { id: Screen; name: string; category: string; description: string; levels: number; duration: string; icon: React.ReactNode; color: string; badge?: string }[] = [
  {
    id: "game-attention",
    name: "Velocidade de Atenção",
    category: "Atenção e tempo de reação",
    description: "Toque na estrela assim que ela aparecer — ela muda de lugar a cada acerto, ficando mais rápida.",
    levels: 3,
    duration: "20–30 s",
    badge: "Novo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: "bg-primary/10 text-primary",
  },
  {
    id: "game-pairs",
    name: "Associação de Pares",
    category: "Memória de trabalho",
    description: "Vire duas cartas por vez e encontre os pares iguais. Exercita memória e concentração.",
    levels: 3,
    duration: "2–5 min",
    badge: "Novo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    color: "bg-accent/10 text-accent-dark",
  },
  {
    id: "game-categories",
    name: "Categorias",
    category: "Linguagem semântica",
    description: "Categoria exibida na tela — toque em todas as palavras que pertencem a ela antes do tempo acabar.",
    levels: 3,
    duration: "20–30 s",
    badge: "Novo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "game-session",
    name: "Associação de Imagens",
    category: "Memória visual",
    description: "Paciente associa pares de imagens com suas palavras correspondentes.",
    levels: 3,
    duration: "15–20 min",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    color: "bg-rose-50 text-rose-600",
  },
];

export default function Games({ navigate, selectedPatientId }: Props) {
  const patient = mockPatients.find((p) => p.id === selectedPatientId) ?? mockPatients[0];

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-800 text-white">Jogos cognitivos</h1>
          <p className="text-white/70 text-sm mt-0.5">Selecione um jogo para iniciar sessão</p>
        </div>

        <div className="max-w-2xl mx-auto mt-4">
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-500">Paciente selecionado</p>
              <p className="text-white text-sm font-700 truncate">{patient.name}</p>
            </div>
            <button
              onClick={() => navigate("patients")}
              className="text-white/70 text-xs font-600 hover:text-white transition-colors"
            >
              Trocar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-3">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => navigate(game.id, selectedPatientId)}
              className="w-full bg-surface rounded-2xl border border-border shadow-sm p-4 hover:border-primary/40 hover:shadow-md active:scale-[0.99] transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${game.color}`}>
                  {game.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm font-700 text-text truncate">{game.name}</h3>
                      {game.badge && (
                        <span className="text-[9px] font-800 text-white bg-accent px-1.5 py-0.5 rounded-full flex-shrink-0 tracking-wide">{game.badge}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-600 text-text-muted bg-surface-2 px-2 py-0.5 rounded-full flex-shrink-0">{game.duration}</span>
                  </div>
                  <p className="text-[11px] font-600 text-text-muted mt-0.5">{game.category}</p>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{game.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-text-muted font-600">Níveis:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < game.levels ? "bg-accent" : "bg-border"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4CFC5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}

          <div className="bg-surface-2 rounded-2xl border border-dashed border-border p-4 flex flex-col items-center gap-2 text-center mt-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p className="text-xs text-text-muted font-600">Novos jogos em breve</p>
            <p className="text-[11px] text-text-light">Atenção visual, coordenação motora e mais</p>
          </div>
        </div>
      </div>

      <NavBar active="games" navigate={navigate} />
    </div>
  );
}
