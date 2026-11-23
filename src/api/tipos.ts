// Contratos da API (espelham backend/app/schemas.py).

export type Jogo = "atencao" | "pares" | "categorias" | "imagens";

export interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  telefone: string | null;
  tipo_vinculo: string | null;
  nome_instituicao: string | null;
  versao_termo: string | null;
  termo_aceito_em: string | null;
}

export interface TokenSaida {
  access_token: string;
  usuario: Usuario;
}

export interface IdosoEntrada {
  nome_completo: string;
  data_nascimento?: string | null;
  condicao?: string | null;
  nivel_tecnologia?: string | null;
  observacoes?: string | null;
}

export interface CadastroEntrada {
  nome_completo: string;
  email: string;
  senha: string;
  telefone?: string | null;
  tipo_vinculo?: string | null;
  nome_instituicao?: string | null;
  aceite_termo: boolean;
  versao_termo?: string;
  idoso?: IdosoEntrada | null;
}

export interface PacienteResumo {
  id: string;
  nome_completo: string;
  idade: number | null;
  condicao: string | null;
  observacoes: string | null;
  total_sessoes: number;
  ultima_sessao: string | null;
  indice: number | null;
  tendencia: "up" | "down" | "stable";
  estado: "aprendendo" | "estavel" | "piora" | "melhora";
  alerta: string | null;
  dominios: Record<"memoria" | "atencao" | "linguagem" | "executiva" | "visuoespacial", number | null>;
  historico: { semana: string; media: number | null; sessoes: number }[];
  por_jogo: { jogo: Jogo; estado: string; sessoes: number; faltam: number }[];
}

export interface SessaoSaida {
  id: string;
  paciente_id: string;
  jogo: Jogo;
  nivel: number;
  iniciada_em: string;
  finalizada_em: string;
  duracao_ms: number;
  pontuacao: number | null;
  metricas: Record<string, number | null>;
  versao_pontuacao: string;
  observacoes: string | null;
  paciente_nome?: string;
}

export interface Painel {
  nome_cuidador: string;
  total_pacientes: number;
  sessoes_hoje: number;
  alertas: number;
  pacientes: PacienteResumo[];
  sessoes_recentes: SessaoSaida[];
}

export interface Insight {
  paciente_id: string;
  paciente_nome: string;
  tipo: "alerta" | "melhora" | "recomendacao" | "tendencia";
  titulo: string;
  mensagem: string;
  jogo: Jogo | null;
}

export interface EventoSessao {
  t: number;
  tipo: "estimulo" | "toque" | "omissao" | "virada" | "tentativa";
  alvo?: string;
  correto?: boolean;
  reacao_ms?: number;
  dados?: Record<string, unknown>;
}

export interface SessaoEntrada {
  jogo: Jogo;
  nivel: number;
  iniciada_em: string;
  finalizada_em: string;
  eventos: EventoSessao[];
  contexto?: Record<string, unknown>;
  observacoes?: string | null;
}
