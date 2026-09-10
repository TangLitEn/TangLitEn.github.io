import type { ComponentType } from "react";
import type { Heading } from "../../lib/posts";
import UniformPlaneWaves from "./uniform-plane-waves/Visualizer";

type PostExperiment = { Component: ComponentType; heading: Heading };

// Register trusted React components here. Markdown remains content-only and
// cannot execute code. Each project owns its components and scoped stylesheet.
const experiments: Readonly<Record<string, PostExperiment>> = {
  "uniform-plane-waves": {
    Component: UniformPlaneWaves,
    heading: { id: "explore", text: "Explore the boundary", depth: 2 },
  },
};

export function getPostExperiment(slug: string): PostExperiment | undefined {
  return Object.hasOwn(experiments, slug) ? experiments[slug] : undefined;
}
