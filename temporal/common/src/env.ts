import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {
    TEMPORAL_NAMESPACE: z.string(),
    TEMPORAL_SERVER: z.string(),
  },
  runtimeEnv: {
    TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE,
    TEMPORAL_SERVER: process.env.TEMPORAL_SERVER,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
