import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, definirToken, json, renovarSessao } from "../api/client";
import type { CadastroEntrada, TokenSaida, Usuario } from "../api/tipos";

interface Auth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: CadastroEntrada) => Promise<void>;
  sair: () => Promise<void>;
  /** Registra o aceite da versão atual do termo e atualiza o usuário. */
  aceitarTermo: (versao: string) => Promise<void>;
  excluirConta: () => Promise<void>;
}

const AuthCtx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir ou recarregar a página, tenta recuperar a sessão pelo cookie de renovação
  useEffect(() => {
    let ativo = true;
    renovarSessao()
      .then(async (ok) => {
        if (ok && ativo) setUsuario(await api<Usuario>("/auth/eu"));
      })
      .catch(() => undefined)
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const aplicar = (t: TokenSaida) => {
    definirToken(t.access_token);
    setUsuario(t.usuario);
  };

  const entrar = useCallback(async (email: string, senha: string) => {
    aplicar(await api<TokenSaida>("/auth/login", json({ email: email.trim(), senha })));
  }, []);

  const cadastrar = useCallback(async (dados: CadastroEntrada) => {
    aplicar(await api<TokenSaida>("/auth/cadastro", json(dados)));
  }, []);

  const sair = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      definirToken(null);
      setUsuario(null);
    }
  }, []);

  const aceitarTermo = useCallback(async (versao: string) => {
    await api("/conta/aceite", json({ versao_termo: versao }));
    setUsuario(await api<Usuario>("/auth/eu"));
  }, []);

  const excluirConta = useCallback(async () => {
    await api("/conta", { method: "DELETE" });
    definirToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ usuario, carregando, entrar, cadastrar, sair, aceitarTermo, excluirConta }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): Auth {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
