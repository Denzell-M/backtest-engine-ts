import type {
  BacktestConfig,
  Bar,
  EquityPoint,
  Fill,
  Order,
  Signal,
} from "./types.js";
import { createPortfolio, applyFill, markToMarketEquity } from "../portfolio/portfolio.js";
import { validateBar } from "./validate.js";
import type { ExecutionModel } from "../execution/execution-model.js";
import { MidFillExecutionModel } from "../execution/mid-fill.js";
import { SpreadCrossExecutionModel } from "../execution/spread-cross.js";

export interface Strategy {
  onBar(bar: Bar): Signal[];
}

export type BacktestResult = {
  fills: Fill[];
  equityCurve: EquityPoint[];
  finalEquity: number;
  realizedPnl: number;
  feesPaid: number;
};

function createExecutionModel(cfg: BacktestConfig): ExecutionModel {
  const feeBps = cfg.feeBps ?? 0;

  if (cfg.execution === "mid") {
    return new MidFillExecutionModel({ feeBps, midPrice: "hl2" });
  }

  return new SpreadCrossExecutionModel({
    feeBps,
    halfSpreadBps: cfg.halfSpreadBps ?? 0,
    reference: "close",
  });
}

export function runBacktest({
  bars,
  strategy,
  config,
}: {
  bars: Bar[];
  strategy: Strategy;
  config: BacktestConfig;
}): BacktestResult {
  // Deterministic order ids (important for reproducible tests).
  let orderSeq = 0;
  const nextOrderId = () => `ord_${++orderSeq}`;

  const execution = createExecutionModel(config);
  const portfolio = createPortfolio(config.startingCash);

  const fills: Fill[] = [];
  const equityCurve: EquityPoint[] = [];

  for (const bar of bars) {
    validateBar(bar);
    const signals = strategy.onBar(bar);

    for (const s of signals) {
      const order: Order = {
        id: nextOrderId(),
        ts: s.ts,
        type: "market",
        side: s.side,
        qty: s.qty,
        remainingQty: s.qty,
        reason: s.reason,
      };

      const orderFills = execution.fill(order, bar);
      // v1: market order fills entirely or not at all; partial fills can be added later.
      for (const f of orderFills) {
        fills.push(f);
        applyFill(portfolio, f);
        order.remainingQty -= f.qty;
      }
    }

    const markPrice = bar.close;
    equityCurve.push({
      ts: bar.ts,
      equity: markToMarketEquity(portfolio, markPrice),
      cash: portfolio.cash,
      positionQty: portfolio.positionQty,
      markPrice,
    });
  }

  const finalEquity = equityCurve.length
    ? equityCurve[equityCurve.length - 1].equity
    : config.startingCash;

  return {
    fills,
    equityCurve,
    finalEquity,
    realizedPnl: portfolio.realizedPnl,
    feesPaid: portfolio.feesPaid,
  };
}
