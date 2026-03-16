import type { Fill } from "../core/types.js";

export type PortfolioState = {
  cash: number;
  positionQty: number;
  avgEntryPrice: number; // naive avg cost for position
  realizedPnl: number;
  feesPaid: number;
};

export function createPortfolio(startingCash: number): PortfolioState {
  return {
    cash: startingCash,
    positionQty: 0,
    avgEntryPrice: 0,
    realizedPnl: 0,
    feesPaid: 0,
  };
}

export function applyFill(state: PortfolioState, fill: Fill) {
  const signedQty = fill.side === "buy" ? fill.qty : -fill.qty;

  // Cash changes opposite to signed quantity
  const cashDelta = -signedQty * fill.price - fill.fee;
  state.cash += cashDelta;
  state.feesPaid += fill.fee;

  const prevQty = state.positionQty;
  const nextQty = prevQty + signedQty;

  // If position direction doesn't change, update avg entry.
  // If it reduces/flat/closes, realize PnL on closed portion.
  if (prevQty === 0 || Math.sign(prevQty) === Math.sign(nextQty)) {
    // Same direction or opening
    const prevCost = state.avgEntryPrice * Math.abs(prevQty);
    const addCost = fill.price * Math.abs(signedQty);
    const denom = Math.abs(nextQty);
    state.avgEntryPrice = denom === 0 ? 0 : (prevCost + addCost) / denom;
  } else {
    // Reducing or flipping direction
    const closedQty = Math.min(Math.abs(prevQty), Math.abs(signedQty));
    const pnlPerUnit = fill.side === "sell" ? fill.price - state.avgEntryPrice : state.avgEntryPrice - fill.price;
    // If prevQty >0 (long) and we sell => realized = (sell - avg) * closed
    // If prevQty <0 (short) and we buy  => realized = (avg - buy) * closed
    state.realizedPnl += pnlPerUnit * closedQty;

    // If flipped past zero, new avg entry becomes fill price for remainder
    if (Math.sign(nextQty) !== Math.sign(prevQty) && nextQty !== 0) {
      state.avgEntryPrice = fill.price;
    }
    if (nextQty === 0) {
      state.avgEntryPrice = 0;
    }
  }

  state.positionQty = nextQty;
}

export function markToMarketEquity(state: PortfolioState, markPrice: number) {
  return state.cash + state.positionQty * markPrice;
}
