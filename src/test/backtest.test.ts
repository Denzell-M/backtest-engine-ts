import { describe, expect, test } from "vitest";

import { runBacktest } from "../core/backtest.js";
import type { Bar } from "../core/types.js";
import { SmaCrossStrategy } from "../strategies/sma-cross.js";

function barsDeterministic(n = 50): Bar[] {
  const bars: Bar[] = [];
  let price = 100;
  let ts = Date.UTC(2025, 0, 1);

  for (let i = 0; i < n; i++) {
    const drift = 0.02;
    const noise = ((i * 9301 + 49297) % 233280) / 233280 - 0.5;
    const nextClose = price * (1 + (drift + noise * 0.1) / 100);

    const open = price;
    const close = nextClose;
    const high = Math.max(open, close) * (1 + 0.001);
    const low = Math.min(open, close) * (1 - 0.001);

    bars.push({ ts, open, high, low, close });
    price = close;
    ts += 86_400_000;
  }

  return bars;
}

describe("runBacktest", () => {
  test("is deterministic for the same inputs", () => {
    const bars = barsDeterministic(120);
    const stratA = new SmaCrossStrategy({ fast: 5, slow: 12, qty: 1 });
    const stratB = new SmaCrossStrategy({ fast: 5, slow: 12, qty: 1 });

    const r1 = runBacktest({
      bars,
      strategy: stratA,
      config: {
        startingCash: 10_000,
        feeBps: 1,
        execution: "spreadCross",
        halfSpreadBps: 5,
      },
    });

    const r2 = runBacktest({
      bars,
      strategy: stratB,
      config: {
        startingCash: 10_000,
        feeBps: 1,
        execution: "spreadCross",
        halfSpreadBps: 5,
      },
    });

    expect(r1.fills).toEqual(r2.fills);
    expect(r1.equityCurve).toEqual(r2.equityCurve);
    expect(r1.finalEquity).toBe(r2.finalEquity);
  });

  test("equity matches accounting identity at each step", () => {
    const bars = barsDeterministic(80);
    const strat = new SmaCrossStrategy({ fast: 4, slow: 10, qty: 1 });

    const r = runBacktest({
      bars,
      strategy: strat,
      config: {
        startingCash: 10_000,
        execution: "mid",
        feeBps: 0,
      },
    });

    for (const p of r.equityCurve) {
      const expected = p.cash + p.positionQty * p.markPrice;
      expect(p.equity).toBeCloseTo(expected, 10);
    }
  });
});
