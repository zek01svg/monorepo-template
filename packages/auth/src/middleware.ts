import { createMiddleware } from "hono/factory";

import type { Session } from "./index";
import { getAuthClient } from "./client";

export const authMiddleware = (ENV: "development" | "production") =>
  createMiddleware<{
    Variables: {
      user: Session["user"];
      session: Session["session"];
    };
  }>(async (c, next) => {
    const { data: session } = await getAuthClient(ENV).getSession();
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("session", session.session);
    c.set("user", session.user);

    await next();
  });
