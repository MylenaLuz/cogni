import type { Navigate } from "../App";
import { corIndice, rotuloEstado } from "../data";
import { useAuth } from "../state/AuthContext";
import { useData } from "../state/DataContext";
import Avatar from "../components/Avatar";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

const hoje = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

export default function Dashboard({ navigate }: Props) {
  const { sair } = useAuth();
  const { carregando, erro, nomeCuidador, patients, recentSessions, sessionsToday, recarregar } = useData();
  const comAlerta = patients.filter((p) => p.alert);
  const recentes = recentSessions.slice(0, 5);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white/80 text-sm font-500">Olá,</p>
            <h1 className="text-white text-xl font-800 truncate">{nomeCuidador || "…"}</h1>
            <p className="text-white/80 text-sm font-500 mt-0.5">{hoje}</p>
          </div>
          <div className="flex items-center gap-3">
            {nomeCuidador && (
              <button onClick={() => navigate("account")} aria-label="Minha conta" className="rounded-full">
                <Avatar name={nomeCuidador} size="sm" light />
              </button>
            )}
            <button
              onClick={() => void sair()}
              className="h-10 px-4 rounded-full bg-white/20 text-white text-sm font-700 hover:bg-white/30 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-5">
          {erro && (
            <div role="alert" className="bg-error/8 border border-error/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-error text-sm font-600">{erro}</p>
              <button onClick={() => void recarregar()} className="text-sm font-700 text-error underline">Tentar de novo</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pessoas", value: patients.length, color: "text-primary", sub: "acompanhadas" },
              { label: "Sessões", value: sessionsToday, color: "text-accent-dark", sub: "hoje" },
              { label: "Avisos", value: comAlerta.length, color: "text-error", sub: "para olhar" },
            ].map((c) => (
              <div key={c.label} className="bg-surface rounded-2xl p-4 border border-border shadow-sm text-center">
                <div className={`text-3xl font-800 ${c.color}`}>{carregando ? "–" : c.value}</div>
                <div className="text-sm font-600 text-text-muted mt-0.5 leading-tight">{c.label}</div>
                <div className="text-xs text-text-light">{c.sub}</div>
              </div>
            ))}
          </div>

          {comAlerta.map((p) => (
            <div key={p.id} className="bg-error/8 border-2 border-error/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-error font-700 text-base">Vale olhar — {p.name}</p>
                <p className="text-text-muted text-sm mt-0.5 leading-snug">{p.alert}</p>
              </div>
              <button
                onClick={() => navigate("patient-detail", p.id)}
                className="flex-shrink-0 text-sm font-700 text-error border border-error/30 rounded-lg px-3 py-2 hover:bg-error/10 transition-colors"
              >
                Ver
              </button>
            </div>
          ))}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-700 text-text">Pessoas</h2>
              <button onClick={() => navigate("patients")} className="text-sm font-700 text-primary hover:underline">Ver todas</button>
            </div>
            {!carregando && patients.length === 0 && (
              <div className="bg-surface rounded-2xl border border-border p-5 text-center">
                <p className="text-base text-text font-700">Ninguém cadastrado ainda</p>
                <p className="text-sm text-text-muted mt-1">Cadastre a primeira pessoa para começar as sessões.</p>
                <button onClick={() => navigate("patient-new")} className="mt-4 h-11 px-5 bg-primary text-white rounded-2xl text-base font-700">
                  Cadastrar pessoa
                </button>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {patients.map((p) => {
                const est = rotuloEstado(p.state);
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate("patient-detail", p.id)}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-md active:scale-[0.99] transition-all text-left w-full"
                  >
                    <Avatar name={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-700 text-text truncate">{p.name}</p>
                        {p.alert && <span className="w-2 h-2 rounded-full bg-error flex-shrink-0" aria-label="Com aviso" />}
                      </div>
                      <span className={`inline-block text-xs font-700 px-2 py-0.5 rounded-full mt-1 ${est.cls}`}>{est.label}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-lg font-800 ${p.index === null ? "text-text-muted" : corIndice(p.index)}`}>
                        {p.index === null ? "—" : p.index}
                      </span>
                      <p className="text-xs text-text-light">índice</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {recentes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-700 text-text">Sessões recentes</h2>
                <button onClick={() => navigate("reports")} className="text-sm font-700 text-primary hover:underline">Relatórios</button>
              </div>
              <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                {recentes.map((s, i) => (
                  <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i < recentes.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-text truncate">{s.patientName}</p>
                      <p className="text-sm text-text-muted truncate">{s.game} · {s.date}</p>
                    </div>
                    <span className={`text-base font-800 flex-shrink-0 ${corIndice(s.score)}`}>{s.score}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-3 pb-4">
            <button onClick={() => navigate("games")} className="bg-primary text-white rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-primary-light active:scale-[0.98] transition-all shadow-md">
              <span className="text-base font-700">Nova sessão</span>
            </button>
            <button onClick={() => navigate("ai-insights")} className="bg-accent-dark text-white rounded-2xl p-4 flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
              <span className="text-base font-700">Ver análises</span>
            </button>
          </div>
        </div>
      </main>

      <NavBar active="dashboard" navigate={navigate} />
    </div>
  );
}
