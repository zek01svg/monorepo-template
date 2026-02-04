import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  runtimeEnvStrict: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
