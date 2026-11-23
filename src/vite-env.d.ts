/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API do Cogni (padrão: http://localhost:8000). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
