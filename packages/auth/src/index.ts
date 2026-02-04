import type { BetterAuthOptions } from "better-auth";
import type { Client } from "better-auth/plugins";
import type { SocialProviders } from "better-auth/social-providers";
import type nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  apiKey,
  bearer,
  jwt,
  oidcProvider,
  openAPI,
  organization,
} from "better-auth/plugins";

import { ac as adminAc } from "./plugins/admin";
import { ac as organizationAc } from "./plugins/organization";

export function initAuth(
  DB: unknown,
  options: {
    baseDomain: string;
    baseUrl: string;
    secret: string | undefined;
    trustedOrigins?: string[];
    socialProviders?: SocialProviders;
    mailer?: nodemailer.Transporter<
      SMTPTransport.SentMessageInfo,
      SMTPTransport.Options
    >;
    getOrganizations: (
      userId: string,
    ) => Promise<string[]> | undefined | string[];
    oidcProvider?: {
      trustedClients: Client[];
    };
  },
) {
  const config = {
    database: drizzleAdapter(DB as Parameters<typeof drizzleAdapter>[0], {
      provider: "pg",
      usePlural: true,
    }),

    baseURL: options.baseUrl,
    secret: options.secret,

    plugins: [
      apiKey(),
      bearer(),
      admin({
        ac: adminAc,
      }),
      openAPI({
        path: "/docs",
      }),
      jwt({
        jwt: {
          definePayload: async ({ user }) => {
            const orgs = await options.getOrganizations(user.id);
            return {
              user,
              aud: orgs,
            };
          },
        },
      }),
      organization({
        sendInvitationEmail: async (data) => {
          const inviteLink = `${new URL(options.baseUrl).origin}/accept-invitation/${data.id}`;
          await options.mailer?.sendMail({
            to: data.email,
            subject: "Invitation to join organization",
            text: `Click the link to join the organization: ${inviteLink}`,
          });
        },
        accessControl: organizationAc,
      }),
      oidcProvider({
        loginPage: "/sign-in",
        trustedClients: options.oidcProvider?.trustedClients,
      }),
    ],

    onAPIError: {
      throw: true,
      onError: (error) => {
        console.error("Auth error:", error);
      },
    },
    trustedOrigins: options.trustedOrigins,

    emailAndPassword: {
      enabled: true,
      sendResetPassword: options.mailer
        ? async ({ user, url }, _request) => {
            await options.mailer?.sendMail({
              to: user.email,
              subject: "Reset your password",
              text: `Click the link to reset your password: ${url}`,
            });
          }
        : undefined,
    },

    // Reference: https://www.better-auth.com/docs/reference/options#user
    user: {
      additionalFields: {},
    },
    socialProviders: options.socialProviders,
    emailVerification: options.mailer
      ? {
          sendVerificationEmail: async ({ user, url }, _request) => {
            await options.mailer?.sendMail({
              to: user.email,
              subject: "Verify your email address",
              text: `Click the link to verify your email: ${url}`,
            });
          },
        }
      : undefined,
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: options.baseDomain,
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
