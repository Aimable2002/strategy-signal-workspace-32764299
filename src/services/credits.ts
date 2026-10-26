// In-memory credit ledger for the prototype. The dev credit toggle overrides the balance for previews.
import { getDevState, setDevState } from "@/lib/devState";
import { transactions as seedTx } from "@/mockData";

let normalBalance = 12.4;
export let txLog = [...seedTx];

export function creditBalance() {
  const c = getDevState().credit;
  return c === "zero" ? 0 : c === "low" ? 1.6 : normalBalance;
}

export function chargeCredits(amount: number, description: string) {
  normalBalance = +(creditBalance() - amount).toFixed(2);
  if (getDevState().credit !== "normal") setDevState({ credit: "normal" });
  txLog = [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), type: "Usage charge", description, amount: -amount }, ...txLog];
}

export function topUp(amount: number, description = "Credit pack") {
  normalBalance = +(creditBalance() + amount).toFixed(2);
  setDevState({ credit: "normal" });
  txLog = [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), type: "Top-up", description, amount }, ...txLog];
}
