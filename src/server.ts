import { buildApp, Order, OrderStatus } from "./app";
import { WebSocketServer } from "ws";
import PQueue from "p-queue";
import { MockDexRouter } from "./dex/MockDexRouter";

async function startServer() {
  const app = buildApp();

  const orders: Record<string, Order> = {};

  const orderQueue = new PQueue({
    concurrency: 10,
  });

  let wss: WebSocketServer;

  app.addHook("onReady", async () => {
    wss = new WebSocketServer({ server: app.server });

    wss.on("connection", (ws) => {
      ws.send(JSON.stringify({ message: "WebSocket connected" }));
    });
  });

  function emitStatus(orderId: string, status: OrderStatus, extra = {}) {
    const payload = JSON.stringify({ orderId, status, ...extra });
    wss?.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  }

  async function retry(
    fn: () => Promise<void>,
    retries: number,
    delay = 1000
  ): Promise<void> {
    try {
      await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise((res) => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 2);
    }
  }

  async function processOrder(order: Order) {
    const router = new MockDexRouter();

    try {
      emitStatus(order.orderId, "routing");

      const raydium = await router.getRaydiumQuote(order.quantity);
      const meteora = await router.getMeteoraQuote(order.quantity);

      const best =
        raydium.price > meteora.price ? raydium : meteora;

      emitStatus(order.orderId, "building", {
        dex: best.dex,
        price: best.price,
      });

      emitStatus(order.orderId, "submitted");

      const result = await router.executeSwap(best.dex);

      emitStatus(order.orderId, "confirmed", {
        txHash: result.txHash,
        executedPrice: result.executedPrice,
        dex: best.dex,
      });
    } catch (err: any) {
      emitStatus(order.orderId, "failed", {
        error: err.message || "Execution failed",
      });
      throw err;
    }
  }

  

  await app.listen({ port: 3000, host: "0.0.0.0" });
  console.log("🚀 Server running at http://localhost:3000");
}

startServer();
