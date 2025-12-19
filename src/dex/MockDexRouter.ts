const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface DexQuote {
  dex: "Raydium" | "Meteora";
  price: number;
  fee: number;
}

export class MockDexRouter {
  async getRaydiumQuote(amount: number): Promise<DexQuote> {
    await sleep(200);
    return {
      dex: "Raydium",
      price: 100 * (0.98 + Math.random() * 0.04), // ~2–4% variance
      fee: 0.003,
    };
  }

  async getMeteoraQuote(amount: number): Promise<DexQuote> {
    await sleep(200);
    return {
      dex: "Meteora",
      price: 100 * (0.97 + Math.random() * 0.05), // ~3–5% variance
      fee: 0.002,
    };
  }

  async executeSwap(dex: string) {
    await sleep(2000 + Math.random() * 1000);
    return {
      txHash: `MOCK_TX_${Math.random().toString(36).slice(2)}`,
      executedPrice: 100,
    };
  }
}
