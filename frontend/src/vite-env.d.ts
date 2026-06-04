/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string;
  readonly VITE_WC_PROJECT_ID: string;
  readonly VITE_FACTORY_ADDRESS: string;
  readonly VITE_ARBITRATION_ADDRESS: string;
  readonly VITE_ORACLE_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
