// Cliente da API do Cogni.
// O token de acesso fica só em memória; a renovação usa o cookie httpOnly enviado pela API.

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";

let accessToken: string | null = null;
let renovando: Promise<boolean> | null = null;

export function definirToken(token: string | null) {
  accessToken = token;
}

export class ApiErro extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}

async function lerErro(res: Response): Promise<ApiErro> {
  let mensagem = "Não foi possível concluir. Tente novamente.";
  try {
    const corpo = await res.json();
    if (typeof corpo.detail === "string") mensagem = corpo.detail;
    else if (Array.isArray(corpo.detail) && corpo.detail[0]?.msg) mensagem = "Confira os campos preenchidos.";
  } catch {
    /* resposta sem corpo */
  }
  return new ApiErro(res.status, mensagem);
}

export async function renovarSessao(): Promise<boolean> {
  if (!renovando) {
    renovando = fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          accessToken = null;
          return false;
        }
        const corpo = await res.json();
        accessToken = corpo.access_token;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        renovando = null;
      });
  }
  return renovando;
}

export async function api<T>(caminho: string, opcoes: RequestInit = {}, tentarRenovar = true): Promise<T> {
  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res: Response;
  try {
    res = await fetch(`${BASE}${caminho}`, { ...opcoes, headers, credentials: "include" });
  } catch {
    throw new ApiErro(0, "Sem conexão com o servidor do Cogni.");
  }

  if (res.status === 401 && tentarRenovar && !caminho.startsWith("/auth/")) {
    if (await renovarSessao()) return api<T>(caminho, opcoes, false);
  }
  if (!res.ok) throw await lerErro(res);
  // 202/204 e respostas vazias não têm corpo JSON
  const texto = await res.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

export const json = (dados: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(dados) });
