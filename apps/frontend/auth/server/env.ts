import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as dbAuthEnv } from "@repo/db-auth/env";
import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv, dbAuthEnv],
  client: {
    VITE_APP_URL: z.url(),
  },
  server: {
    ARGOCD_CLIENT_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    TEMPORAL_CLIENT_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    AUTH_SECRET: z.string().min(1),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().min(1),
    SMTP_SECURE: z.coerce.boolean(),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string().min(1),
    BASE_DOMAIN: z.string().min(1),
  },
  runtimeEnv: {
    VITE_APP_URL: process.env.VITE_APP_URL ?? `http://localhost:4000`,
    AUTH_POSTGRES_URL: process.env.AUTH_POSTGRES_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    BASE_DOMAIN: process.env.BASE_DOMAIN,
  },
  clientPrefix: "VITE_",
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

export type Env = {
  [K in keyof typeof env as K extends `VITE_${string}` ? K : never]: string;
} & {
  NODE_ENV: typeof env.NODE_ENV;
};
