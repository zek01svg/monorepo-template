import { Env } from "../server/env";

export const env: Env = {
  VITE_APP_URL: window.__env?.VITE_APP_URL ?? import.meta.env.VITE_APP_URL,
  NODE_ENV:
    (window.__env?.NODE_ENV ?? import.meta.env.DEV)
      ? "development"
      : "production",
};
