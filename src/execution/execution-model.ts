import type { Bar, Fill, Order } from "../core/types.js";

export interface ExecutionModel {
  fill(order: Order, bar: Bar): Fill[];
}
