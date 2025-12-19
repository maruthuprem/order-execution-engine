import PQueue from "p-queue";

export const orderQueue = new PQueue({
  concurrency: 10, // max 10 parallel orders
});
