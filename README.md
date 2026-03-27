<h1> backtest-engine-ts </h1>

A **minimal event-driven backtesting engine** in TypeScript for **single-instrument OHLC bars**.

The goal is to build **trustworthy infrastructure**:

- deterministic replay (same inputs + config → same outputs)
- explicit execution assumptions (mid-fill vs spread-cross)
- simple accounting (cash/position/PnL)
- testable boundaries

<h2> Quickstart </h2>

```bash
pnpm install
pnpm dev
```

This runs the example in `src/examples/sma-cross.ts`.

<h2> Run tests </h2>

```bash
pnpm test
```

<h2> Core concepts </h2>

<h3> Data model </h3>

- `Bar`: OHLC (optional volume)
- `Signal`: strategy intent
- `Order` → `Fill`: execution model output

<h3> Execution models (v1) </h3>

- **Mid-fill**: debugging baseline (uses HL2 by default)
- **Spread-cross**: default realism baseline for OHLC
  - buy fills at `close + halfSpread`
  - sell fills at `close - halfSpread`

Where `halfSpread` is configurable (bps).

<h2> Project layout </h2>h2>

- `src/core/`
  - `types.ts` domain types
  - `backtest.ts` runner
- `src/execution/` execution models
- `src/portfolio/` portfolio/accounting
- `src/strategies/` example strategies
- `src/examples/` runnable scripts
- `src/test/` tests

<h2> Notes / limitations </h2>

- v1 uses market orders and fills them immediately on each bar
- partial fills, limit orders, and more realistic bar-based execution can be added later
