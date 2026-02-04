import type { Config } from "drizzle-kit";

if (!process.env.AUTH_POSTGRES_URL) {
  throw new Error("Missing AUTH_POSTGRES_URL");
}

const nonPoolingUrl = process.env.AUTH_POSTGRES_URL.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl + "?sslmode=require",
  },
  casing: "snake_case",
} satisfies Config;
