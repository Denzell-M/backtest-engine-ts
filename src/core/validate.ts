import type { Bar } from "./types.js";

export function validateBar(bar: Bar) {
  if (!(bar.ts > 0)) throw new Error("bar.ts must be > 0");
  for (const k of ["open", "high", "low", "close"] as const) {
    const v = bar[k];
    if (!Number.isFinite(v) || v <= 0) throw new Error(`bar.${k} must be finite and > 0`);
  }
  if (bar.high < bar.low) throw new Error("bar.high must be >= bar.low");
  if (bar.high < bar.open || bar.high < bar.close) {
    throw new Error("bar.high must be >= open and close");
  }
  if (bar.low > bar.open || bar.low > bar.close) {
    throw new Error("bar.low must be <= open and close");
  }
}
