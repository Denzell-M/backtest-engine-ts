export type Side = "buy" | "sell";

export type Bar = {
  ts: number; // unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type Signal = {
  ts: number;
  side: Side;
  qty: number;
  reason?: string;
};

export type OrderType = "market";

export type Order = {
  id: string;
  ts: number;
  type: OrderType;
  side: Side;
  qty: number;
  remainingQty: number;
  reason?: string;
};

export type Fill = {
  orderId: string;
  ts: number;
  side: Side;
  qty: number;
  price: number;
  fee: number;
};

export type EquityPoint = {
  ts: number;
  equity: number;
  cash: number;
  positionQty: number;
  markPrice: number;
};

export type BacktestConfig = {
  startingCash: number;
  feeBps?: number; // e.g. 1 = 0.01%
  halfSpreadBps?: number; // used by spread-cross model
  execution: "mid" | "spreadCross";
};
