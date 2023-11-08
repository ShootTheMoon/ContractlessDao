export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      TOKEN_ADDRESS: string;
      MONGODB_USERNAME: string;
      MONGODB_PASSWORD: string;
      MONGODB_SERVER: string;
    }
  }
}