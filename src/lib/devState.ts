// Prototype-only dev toggles (role, signed-in, credit state). Shared app-wide via useSyncExternalStore.
import { useSyncExternalStore } from "react";

export type Role = "buyer" | "builder" | "admin";
export type CreditState = "normal" | "low" | "zero";
export interface DevState { role: Role; loggedIn: boolean; credit: CreditState }

let state: DevState = { role: "builder", loggedIn: true, credit: "normal" };
const subs = new Set<() => void>();

export function getDevState() { return state; }
export function setDevState(patch: Partial<DevState>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}
export function useDevState() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);
}
