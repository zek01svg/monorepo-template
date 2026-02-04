import type { env } from "./env";
import type { Service } from "./types";
import {
  KUBERNETES_INTERNAL_SERVICE_MAP,
  LOCAL_SERVICE_MAP,
  PRODUCTION_SERVICE_MAP,
  SERVICE_CONFIG,
} from "./config";

export const SERVICES = Object.keys(SERVICE_CONFIG);

export function getTrustedOrigins(ENV: typeof env.NODE_ENV) {
  return SERVICES.map((service) => getBaseUrl(ENV, service));
}

export function getBaseUrl(
  ENV: typeof env.NODE_ENV,
  service: Service,
  internal = false,
) {
  if (ENV === "production") {
    if (internal) {
      return KUBERNETES_INTERNAL_SERVICE_MAP[service];
    } else {
      return PRODUCTION_SERVICE_MAP[service];
    }
  } else {
    return LOCAL_SERVICE_MAP[service];
  }
}
