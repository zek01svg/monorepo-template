import { initAuth } from "@repo/auth-common";
import { eq, inArray } from "@repo/db-auth";
import { db } from "@repo/db-auth/client";
import { members, organizations } from "@repo/db-auth/schema";
import {
  getBaseUrl,
  getTrustedOrigins,
  PROD_DOMAIN,
} from "@repo/service-discovery";

import { env } from "./env";
import { mailer } from "./mailer";

export const auth = initAuth(db, {
  baseDomain: env.BASE_DOMAIN,
  baseUrl: getBaseUrl(env.NODE_ENV, "auth") + "/api/auth",
  secret: env.AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(env.NODE_ENV),
  mailer: mailer,
  getOrganizations: async (userId) => {
    const orgs = await db.query.members.findMany({
      where: eq(members.userId, userId),
    });
    const orgSlugs = await db.query.organizations.findMany({
      columns: {
        slug: true,
      },
      where: inArray(
        organizations.id,
        orgs.map((org) => org.organizationId),
      ),
    });
    return orgSlugs.map((org) => org.slug ?? "");
  },
  oidcProvider: {
    trustedClients:
      env.NODE_ENV === "production"
        ? [
            {
              clientId: "argocd",
              clientSecret: env.ARGOCD_CLIENT_SECRET,
              type: "web",
              redirectURLs: [`https://argocd.${PROD_DOMAIN}/oauth2/callback`],
              name: "ArgoCD",
              metadata: null,
              disabled: false,
              skipConsent: true,
            },
            {
              clientId: "temporal",
              clientSecret: env.TEMPORAL_CLIENT_SECRET,
              type: "web",
              redirectURLs: [`https://temporal.${PROD_DOMAIN}`],
              name: "Temporal",
              metadata: null,
              disabled: false,
              skipConsent: true,
            },
          ]
        : [],
  },
});
