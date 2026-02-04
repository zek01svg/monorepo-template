import { createRoute, z } from "@hono/zod-openapi";

import { createApp } from "~/factory";

export const helloRoute = createApp().openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Success message",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    const { name } = c.req.valid("json");
    return c.json({ message: `Hello, ${name}!` });
  },
);
