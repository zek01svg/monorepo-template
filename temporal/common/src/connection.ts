import { env } from "./env";

export const namespace = env.TEMPORAL_NAMESPACE;

interface ConnectionOptions {
  address: string;
  tls?: { clientCertPair: { crt: Buffer; key: Buffer } };
}

export function getConnectionOptions(): ConnectionOptions {
  return {
    address: env.TEMPORAL_SERVER,
  };
}
