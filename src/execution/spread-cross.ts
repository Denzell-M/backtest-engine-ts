import type { Bar, Fill, Order } from "../core/types.js";
import { bpsToFrac, clamp } from "../core/utils.js";
import type { ExecutionModel } from "./execution-model.js";

export type SpreadCrossConfig = {
  feeBps?: number;
  halfSpreadBps: number; // e.g. 5 = 5 bps = 0.05%
  reference: "close"; // keep simple for v1
};

export class SpreadCrossExecutionModel implements ExecutionModel {
  constructor(private cfg: SpreadCrossConfig) {}

  fill(order: Order, bar: Bar): Fill[] {
    if (order.remainingQty <= 0) return [];

    const qty = order.remainingQty;
    const ref = bar.close;
    const halfSpread = ref * bpsToFrac(this.cfg.halfSpreadBps);
    const price = order.side === "buy" ? ref + halfSpread : ref - halfSpread;

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
