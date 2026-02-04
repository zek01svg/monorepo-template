import {
  adminClient,
  oidcClient,
  organizationClient,
} from "better-auth/client/plugins";
import { jwt } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

import { getBaseUrl } from "@repo/service-discovery";

export const getAuthClient = (ENV: "development" | "production") =>
  createAuthClient({
    baseURL: getBaseUrl(ENV, "auth") + "/api/auth",
    plugins: [jwt(), organizationClient(), oidcClient(), adminClient()],
  });
