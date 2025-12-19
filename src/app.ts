import Fastify from "fastify";

export type OrderStatus =
  | "pending"
  | "routing"
  | "building"
  | "submitted"
  | "confirmed"
  | "failed";

export interface Order {
  orderId: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  status: OrderStatus;
}

export function buildApp() {
  const app = Fastify({ logger: true });

  // =========================
  // Routes
  // =========================

  app.get("/", async () => {
    return {
      message: "Order Execution Engine running",
      health: "/health",
    };
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.post("/api/orders/execute", async (request, reply) => {
    const { symbol, side, quantity, price } = request.body as any;

    if (!symbol || !side || !quantity || !price) {
      return reply.status(400).send({ error: "Invalid order payload" });
    }

    const orderId = Date.now().toString();

    // IMPORTANT: only return response here
    return reply.send({
      orderId,
      status: "pending",
    });
  });

  return app;
}
