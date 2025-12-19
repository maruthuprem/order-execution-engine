import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { buildApp } from "../app";

describe("Order API", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready(); 
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects invalid order payload", async () => {
    const res = await request(app.server)
      .post("/api/orders/execute")
      .set("Content-Type", "application/json") 
      .send({}); // invalid payload

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid order payload");
  });

  it("accepts valid order and returns pending", async () => {
    const res = await request(app.server)
      .post("/api/orders/execute")
      .set("Content-Type", "application/json") 
      .send({
        symbol: "SOL/USDC",
        side: "buy",
        quantity: 10,
        price: 100,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");
    expect(res.body.orderId).toBeDefined();
  });
});
