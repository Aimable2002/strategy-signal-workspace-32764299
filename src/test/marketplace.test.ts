import { describe, expect, it } from "vitest";
import { filterListings, getTrialsRemaining, orderTotal, reviewListing, runTrialBacktest, TRIAL_LIMIT } from "@/services/api";
import { listings } from "@/mockData";

describe("marketplace rules", () => {
  it("has 12 mock strategies", () => {
    expect(listings).toHaveLength(12);
  });
  it("buyers get 3 test runs per strategy", async () => {
    expect(TRIAL_LIMIT).toBe(3);
    expect(await getTrialsRemaining("l7")).toBe(3);
  });
  it("blocks a 4th test run", async () => {
    const s = { symbol: "AUDUSD", timeframe: "H4", from: "2023-01-01", to: "2024-12-31", deposit: 10000 };
    for (let i = 0; i < 3; i++) await runTrialBacktest("l11", s);
    await expect(runTrialBacktest("l11", s)).rejects.toThrow();
  }, 20000);
  it("source option costs the higher price only when offered", () => {
    expect(orderTotal({ price: 149, sourcePrice: 349 }, true)).toBe(349);
    expect(orderTotal({ price: 199, sourcePrice: null }, true)).toBe(199);
  });
  it("sorts by lowest drawdown", () => {
    const out = filterListings(listings, { sort: "drawdown" });
    expect(out[0]!.metrics.drawdown).toBe(Math.min(...listings.map((l) => l.metrics.drawdown)));
  });
  it("rejecting requires a reason", async () => {
    await expect(reviewListing("q1", { approve: false })).rejects.toThrow();
  });
});
