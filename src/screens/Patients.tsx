import { useState } from "react";
import type { Navigate } from "../App";
import { corIndice, rotuloEstado } from "../data";
import { useData } from "../state/DataContext";
import Avatar from "../components/Avatar";
import NavBar from "../components/NavBar";

interface Props { navigate: Navigate; selectedPatientId: string; }

export default function Patients({ navigate }: Props) {
  const [search, setSearch] = useState("");
  const { patients, carregando } = useData();

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-800 text-white">Pessoas</h1>
          <button onClick={() => navigate("patient-new")} className="h-10 px-4 bg-white/20 text-white rounded-full text-sm font-700 hover:bg-white/30 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              aria-label="Buscar pessoa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou condição"
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/15 text-white placeholder-white/70 text-sm font-500 focus:outline-none focus:bg-white/25 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-3">
          {!carregando && patients.length === 0 && (
            <div className="bg-surface rounded-2xl border border-border p-5 text-center">
              <p className="text-base text-text font-700">Ninguém cadastrado ainda</p>
              <button onClick={() => navigate("patient-new")} className="mt-4 h-11 px-5 bg-primary text-white rounded-2xl text-base font-700">
                Cadastrar pessoa
              </button>
            </div>
          )}
          {filtered.map((p) => {
            const badge = rotuloEstado(p.state);
            const score = p.index;
            return (
              <button
                key={p.id}
                onClick={() => navigate("patient-detail", p.id)}
                className="w-full bg-surface rounded-2xl border border-border shadow-sm p-4 hover:border-primary/40 hover:shadow-md active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar name={p.name} size="lg" />
                    {p.alert && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-surface" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-700 text-text truncate">{p.name}</h3>
                      <span className={`text-xs font-700 px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">{p.diagnosis}{p.age !== null ? ` · ${p.age} anos` : ""}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted font-600">Índice dos jogos</span>
                          <span className={`text-sm font-800 ${score === null ? "text-text-muted" : corIndice(score)}`}>{score ?? "—"}</span>
                        </div>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score === null ? "bg-border" : score >= 65 ? "bg-accent" : score >= 50 ? "bg-primary" : "bg-error"}`}
                            style={{ width: `${score ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-text-light">{p.sessionCount} sessões · Última: {p.lastSession}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <NavBar active="patients" navigate={navigate} />
    </div>
  );
}
