import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import { app } from "~/index";

describe("Hello Route", () => {
  const client = testClient(app);
  it("should return hello message with valid name", async () => {
    const response = await client.hello.$post({
      json: {
        name: "John",
      },
    });

    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual({
      message: "Hello, John!",
    });
  });

  it("should handle empty string name", async () => {
    const response = await client.hello.$post({
      json: {
        name: "",
      },
    });

    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual({
      message: "Hello, !",
    });
  });

  it("should return 400 when name is missing", async () => {
    const response = await client.hello.$post({
      json: {} as any,
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 when name is not a string", async () => {
    const response = await client.hello.$post({
      json: { name: 123 } as any,
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 when body is invalid JSON", async () => {
    const response = await client.hello.$post("invalid json" as any);

    expect(response.status).toBe(400);
  });

  it("should return 404 for GET method", async () => {
    const response = await app.request("/hello", {
      method: "GET",
    });

    expect(response.status).toBe(404);
  });
});
