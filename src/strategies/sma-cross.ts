import type { Bar, Signal } from "../core/types.js";
import type { Strategy } from "../core/backtest.js";

export class SmaCrossStrategy implements Strategy {
  private closes: number[] = [];
  private position: -1 | 0 | 1 = 0;

  constructor(
    private cfg: {
      fast: number;
      slow: number;
      qty: number;
    },
  ) {
    if (cfg.fast <= 0 || cfg.slow <= 0 || cfg.fast >= cfg.slow) {
      throw new Error("Invalid SMA windows: fast must be >0 and < slow.");
    }
  }

  onBar(bar: Bar): Signal[] {
    this.closes.push(bar.close);
    if (this.closes.length < this.cfg.slow) return [];

    const fast = sma(this.closes, this.cfg.fast);
    const slow = sma(this.closes, this.cfg.slow);

    if (fast > slow && this.position <= 0) {
      // go long
      this.position = 1;
      return [{ ts: bar.ts, side: "buy", qty: this.cfg.qty, reason: "sma_cross_up" }];
    }

    if (fast < slow && this.position >= 0) {
      // go short
      this.position = -1;
      return [{ ts: bar.ts, side: "sell", qty: this.cfg.qty, reason: "sma_cross_down" }];
    }

    return [];
  }
}

function sma(values: number[], window: number) {
  const slice = values.slice(-window);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / window;
}
