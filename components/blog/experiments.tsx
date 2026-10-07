import type { ComponentType } from "react";
import type { SimulationName, SimulationProps } from "../../lib/simulations";
import UniformPlaneWaves from "./uniform-plane-waves/Visualizer";
import MarkovChainBuilder from "./markov-chain/Builder";

// Names refer to simulations, not post slugs. Any post can reuse any entry.
// This allowlist is deliberately explicit: Markdown cannot execute code.
const experiments: Record<SimulationName, ComponentType<SimulationProps>> = {
  "uniform-plane-waves": UniformPlaneWaves,
  "markov-chain": MarkovChainBuilder,
};

export function getSimulationComponent(name: SimulationName) {
  return experiments[name];
}
