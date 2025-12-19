import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../app";

describe("Health Check", () => {
  it("GET /health returns OK", async () => {
    const app = buildApp();
    await app.ready();

    const res = await request(app.server).get("/health");

    expect(res.status).toBe(200);
expect(res.body).toEqual({ status: "ok" });

    await app.close();
  });

  it("GET / returns engine info", async () => {
    const app = buildApp();
    await app.ready();

    const res = await request(app.server).get("/");

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.body.health).toBe("/health");

    await app.close();
  });
});
