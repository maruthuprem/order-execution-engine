import { describe, it, expect } from "vitest";
import { MockDexRouter } from "../dex/MockDexRouter";

describe("DEX Router", () => {
  it("returns Raydium quote", async () => {
    const router = new MockDexRouter();
    const quote = await router.getRaydiumQuote(1);
    expect(quote.dex).toBe("Raydium");
    expect(quote.price).toBeGreaterThan(0);
  });

  it("returns Meteora quote", async () => {
    const router = new MockDexRouter();
    const quote = await router.getMeteoraQuote(1);
    expect(quote.dex).toBe("Meteora");
    expect(quote.price).toBeGreaterThan(0);
  });
});
