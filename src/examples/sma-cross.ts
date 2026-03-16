import { runBacktest } from "../core/backtest.js";
import type { Bar } from "../core/types.js";
import { SmaCrossStrategy } from "../strategies/sma-cross.js";

function makeSyntheticBars(): Bar[] {
  // Deterministic synthetic series.
  const bars: Bar[] = [];
  let price = 100;
  let ts = Date.UTC(2025, 0, 1);

  for (let i = 0; i < 250; i++) {
    const drift = i < 120 ? 0.05 : -0.03;
    const noise = ((i * 9301 + 49297) % 233280) / 233280 - 0.5; // simple LCG-ish
    const nextClose = price * (1 + (drift + noise * 0.2) / 100);

    const open = price;
    const close = nextClose;
    const high = Math.max(open, close) * (1 + 0.001);
    const low = Math.min(open, close) * (1 - 0.001);

    bars.push({
      ts,
      open,
      high,
      low,
      close,
      volume: 1000,
    });

    price = close;
    ts += 24 * 60 * 60 * 1000;
  }

  return bars;
}

const bars = makeSyntheticBars();
const strategy = new SmaCrossStrategy({ fast: 10, slow: 30, qty: 1 });

const result = runBacktest({
  bars,
  strategy,
  config: {
    startingCash: 10_000,
    feeBps: 1,
    execution: "spreadCross",
    halfSpreadBps: 5,
  },
});

console.log({
  fills: result.fills.length,
  finalEquity: result.finalEquity.toFixed(2),
  realizedPnl: result.realizedPnl.toFixed(2),
  feesPaid: result.feesPaid.toFixed(2),
});
