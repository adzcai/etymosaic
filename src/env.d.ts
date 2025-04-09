/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MERRIAM_WEBSTER_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 