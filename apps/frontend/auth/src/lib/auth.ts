import { getAuthClient } from "@repo/auth-common/client";

import { getEnv } from "./env";

export const authClient = getAuthClient(
  getEnv().NODE_ENV as "development" | "production",
);
