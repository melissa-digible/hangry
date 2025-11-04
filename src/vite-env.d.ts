/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YELP_API_KEY: string;
  readonly VITE_SPOONACULAR_API_KEY: string;
  readonly VITE_UNSPLASH_ACCESS_KEY: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

