import { Worker } from "bullmq";
import { redis } from "./redis";
import { MockDexRouter } from "../dex/MockDexRouter";

export function startOrderWorker(
  emitStatus: (orderId: string, status: any, extra?: any) => void,
  logger: any
) {
  new Worker(
    "orders",
    async (job) => {
      const { order } = job.data;
      const router = new MockDexRouter();

      try {
        emitStatus(order.orderId, "routing");

        const raydium = await router.getRaydiumQuote(order.quantity);
        const meteora = await router.getMeteoraQuote(order.quantity);

        const best =
          raydium.price > meteora.price ? raydium : meteora;

        logger.info(
          `[QUEUE] Selected ${best.dex} (price=${best.price.toFixed(2)})`
        );

        emitStatus(order.orderId, "building", {
          dex: best.dex,
          price: best.price,
        });

        emitStatus(order.orderId, "submitted");

        const result = await router.executeSwap(best.dex);

        emitStatus(order.orderId, "confirmed", {
          txHash: result.txHash,
          dex: best.dex,
          executedPrice: result.executedPrice,
        });
      } catch (err: any) {
        emitStatus(order.orderId, "failed", {
          error: err.message,
        });
        throw err; // important → triggers retry
      }
    },
    {
      connection: redis,
      concurrency: 10,
    }
  );
}
