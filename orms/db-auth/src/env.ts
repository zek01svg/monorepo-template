import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    AUTH_POSTGRES_URL: z.string().min(1),
  },
  runtimeEnv: {
    AUTH_POSTGRES_URL: process.env.AUTH_POSTGRES_URL,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
