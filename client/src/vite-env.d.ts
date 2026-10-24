/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_FIREBASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
