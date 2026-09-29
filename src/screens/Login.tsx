import { useState } from "react";
import { Navigate } from "../App";
import { mockCaregiver } from "../data";

interface Props { navigate: Navigate; }

export default function Login({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    setTimeout(() => {
      if (email === mockCaregiver.email && password === mockCaregiver.password) {
        navigate("dashboard");
      } else {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
              <path d="M12 10c4 0 8 2 8 5v1H4v-1c0-3 4-5 8-5" />
              <path d="M8 21l2-4h4l2 4" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1 className="text-3xl font-800 text-text">Cogni</h1>
          <p className="text-text-muted text-base mt-1">Plataforma de Estimulação Cognitiva</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-700 text-text mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="cuidador@cogni.app"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface text-text text-sm font-500 focus:outline-none focus:border-primary transition-colors"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-700 text-text mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-surface text-text text-sm font-500 focus:outline-none focus:border-primary transition-colors"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-white rounded-xl text-base font-700 hover:bg-primary-light disabled:opacity-70 active:scale-[0.98] transition-all shadow-md mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : "Entrar"}
          </button>

          <button type="button" className="text-primary text-sm font-600 text-right hover:underline">
            Esqueci minha senha
          </button>
        </form>

        <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-xs font-700 text-primary mb-1">Credenciais de teste</p>
          <p className="text-xs text-text-muted font-500">E-mail: <span className="font-700 text-text select-all">cuidador@cogni.app</span></p>
          <p className="text-xs text-text-muted font-500 mt-0.5">Senha: <span className="font-700 text-text select-all">cogni123</span></p>
        </div>
      </div>
    </div>
  );
}
