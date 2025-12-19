import { describe, it, expect } from "vitest";
import { retry } from "../queue/retry";

describe("Retry Logic", () => {
  it("retries and eventually succeeds", async () => {
    let attempts = 0;

    await retry(async () => {
      attempts++;
      if (attempts < 2) throw new Error("fail");
    });

    expect(attempts).toBe(2);
  });

  it("fails after max retries", async () => {
    await expect(
      retry(async () => {
        throw new Error("always fail");
      }, 2)
    ).rejects.toThrow();
  });
});
