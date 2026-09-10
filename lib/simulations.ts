// Content metadata stays independent of React and browser-only components.
export const simulations = {
  "uniform-plane-waves": { title: "Explore the boundary", anchor: "explore" },
} as const;

export type SimulationName = keyof typeof simulations;
export type SimulationProps = { instanceId: string; acceptLegacyQuery: boolean };

export function isSimulationName(name: string): name is SimulationName {
  return Object.hasOwn(simulations, name);
}
