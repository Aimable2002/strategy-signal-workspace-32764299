import { describe, expect, it } from "vitest";
import { compareMetrics, getPublishableVersions, publishListing } from "@/services/api";

describe("backtest records", () => {
  it("only versions with a passed record are publishable", async () => {
    expect(await getPublishableVersions("s1")).toEqual(["v2", "v3"]);
    await expect(publishListing({ strategyId: "s1", version: "v1" })).rejects.toThrow();
  });
  it("compare reports percentage difference and match", () => {
    const m = { netProfit: 1000, profitFactor: 1.5, drawdown: 10, winRate: 50, totalTrades: 100, sharpe: 1 };
    const same = compareMetrics(m, { ...m, netProfit: 980 });
    expect(same.matches).toBe(true);
    expect(same.diffs.find((d) => d.metric === "netProfit")!.diffPct).toBe(-2);
    expect(compareMetrics(m, { ...m, drawdown: 15 }).matches).toBe(false);
  });
});
