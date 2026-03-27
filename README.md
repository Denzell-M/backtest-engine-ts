<h1> backtest-engine-ts </h1>

A **minimal event-driven backtesting engine** in TypeScript for **single-instrument OHLC bars**.

The goal is to build **trustworthy infrastructure**:

- deterministic replay (same inputs + config → same outputs)
- explicit execution assumptions (mid-fill vs spread-cross)
- simple accounting (cash/position/PnL)
- testable boundaries

## Quickstart

```bash
pnpm install
pnpm dev
```

This runs the example in `src/examples/sma-cross.ts`.

## Run tests

```bash
pnpm test
```

## Core concepts

### Data model

- `Bar`: OHLC (optional volume)
- `Signal`: strategy intent
- `Order` → `Fill`: execution model output

### Execution models (v1)

- **Mid-fill**: debugging baseline (uses HL2 by default)
- **Spread-cross**: default realism baseline for OHLC
  - buy fills at `close + halfSpread`
  - sell fills at `close - halfSpread`

Where `halfSpread` is configurable (bps).

## Project layout

- `src/core/`
  - `types.ts` domain types
  - `backtest.ts` runner
- `src/execution/` execution models
- `src/portfolio/` portfolio/accounting
- `src/strategies/` example strategies
- `src/examples/` runnable scripts
- `src/test/` tests

## Notes / limitations

- v1 uses market orders and fills them immediately on each bar
- partial fills, limit orders, and more realistic bar-based execution can be added later
