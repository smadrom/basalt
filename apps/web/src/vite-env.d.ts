/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of @basalt/api, e.g. http://localhost:3001 (see root .env.example). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
