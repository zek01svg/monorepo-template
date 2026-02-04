import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "./env";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: env.AUTH_POSTGRES_URL,
    ssl: "require",
  },
  schema,
  casing: "snake_case",
});
