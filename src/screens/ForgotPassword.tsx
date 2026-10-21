import { useState } from "react";
import { Navigate } from "../App";
import { supabase } from "../supabase";

interface Props { navigate: Navigate; }

export default function ForgotPassword({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!email) { 
      setError("Por favor, preencha o seu e-mail."); 
      return; 
    }
    
    setLoading(true);

    // O Supabase vai enviar um e-mail com o link de recuperação para o usuário
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:8443/reset-password",
    });

    if (error) {
      setError("Erro ao enviar o e-mail. Verifique se digitou corretamente.");
    } else {
      setMessage("Link de recuperação enviado! Verifique a sua caixa de entrada.");
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            {/* Ícone de Cadeado/Chave para a recuperação */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-800 text-text">Recuperar Senha</h1>
          <p className="text-text-muted text-base mt-1">Enviaremos um link para o seu e-mail</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-700 text-text mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setMessage(""); }}
              placeholder="seu@email.com"
              className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface text-text text-sm font-500 focus:outline-none focus:border-primary transition-colors"
              autoComplete="email"
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
            ) : "Enviar link de recuperação"}
          </button>

          <button 
            type="button" 
            onClick={() => navigate("login")} 
            className="text-primary text-sm font-600 text-center hover:underline mt-2"
          >
            Voltar para o login
          </button>
        </form>
      </div>
    </div>
  );
}