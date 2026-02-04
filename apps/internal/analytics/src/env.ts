import { createEnv } from "@t3-oss/env-core";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

// Disable TLS certificate verification for self-signed Kafka certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {},
  runtimeEnv: process.env,
});
