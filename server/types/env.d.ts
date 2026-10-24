declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      MONGO_URI?: string;
      SECRET_KEY?: string;
      REFRESH_SECRET?: string;
      CLOUD_NAME?: string;
      API_KEY?: string;
      API_SECRET?: string;
      EMAIL_USER?: string;
      EMAIL_PASS?: string;
    }
  }
}

export {};

