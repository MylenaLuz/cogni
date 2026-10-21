import { useState } from "react";
import { Navigate } from "../App";
import { supabase } from "../supabase";

interface Props { navigate: Navigate; }

export default function ResetPassword({ navigate }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!password || !confirmPassword) { 
      setError("Preencha todos os campos."); 
      return; 
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    
    setLoading(true);

    // O Supabase usa a sessão temporária gerada pelo clique no e-mail para atualizar a senha
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError("Erro ao redefinir a senha. O link pode ter expirado ou ser inválido.");
      setLoading(false);
    } else {
      setMessage("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        // Limpa a URL para remover o token de segurança e manda pro dashboard
        window.history.replaceState(null, "", "/");
        navigate("dashboard");
      }, 2000);
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-800 text-text">Nova Senha</h1>
          <p className="text-text-muted text-base mt-1">Crie uma nova senha de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-700 text-text mb-1.5">Nova Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-border bg-surface text-text text-sm font-500 focus:outline-none focus:border-primary transition-colors"
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

          <div>
            <label className="block text-sm font-700 text-text mb-1.5">Confirmar Nova Senha</label>
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface text-text text-sm font-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 text-primary text-sm font-600 bg-primary/8 rounded-xl px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {message}
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
            ) : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}