import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  runtimeEnvStrict: {
    NODE_ENV: process.env.NODE_ENV,
  },
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
