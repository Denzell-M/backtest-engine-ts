import type { Bar, Fill, Order } from "../core/types.js";
import { bpsToFrac, clamp } from "../core/utils.js";
import type { ExecutionModel } from "./execution-model.js";

export type MidFillConfig = {
  feeBps?: number;
  // Which proxy to use as "mid" for an OHLC bar.
  // hl2 = (high+low)/2, ohlc4 = (open+high+low+close)/4, close = close
  midPrice: "hl2" | "ohlc4" | "close";
};

export class MidFillExecutionModel implements ExecutionModel {
  constructor(private cfg: MidFillConfig) {}

  private mid(bar: Bar) {
    switch (this.cfg.midPrice) {
      case "hl2":
        return (bar.high + bar.low) / 2;
      case "ohlc4":
        return (bar.open + bar.high + bar.low + bar.close) / 4;
      case "close":
        return bar.close;
    }
  }

  fill(order: Order, bar: Bar): Fill[] {
    if (order.remainingQty <= 0) return [];

    const qty = order.remainingQty;
    const price = this.mid(bar);
    const feeBps = this.cfg.feeBps ?? 0;
    const fee = Math.abs(qty * price) * bpsToFrac(feeBps);

    return [
      {
        orderId: order.id,
        ts: bar.ts,
        side: order.side,
        qty: clamp(qty, 0, qty),
        price,
        fee,
      },
    ];
  }
}
