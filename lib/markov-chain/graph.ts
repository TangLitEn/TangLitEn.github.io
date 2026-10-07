import type { Node } from "./data";

export type Point = { x: number; y: number };
export type PositionedNode = Node & Point & { radius: number; lines: string[] };
export const GRAPH_WIDTH = 1200;
export const GRAPH_HEIGHT = 900;

export function wrapLabel(text: string, limit = 18): string[] {
  const words = text.split(/\s+/).flatMap((word) => {
    const pieces: string[] = [];
    for (let i = 0; i < word.length; i += limit) pieces.push(word.slice(i, i + limit));
    return pieces;
  });
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && line.length + word.length + 1 > limit) { lines.push(line); line = word; }
    else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}

export type GraphLayout = { nodes: PositionedNode[]; width: number; height: number };

// Solve on an unconstrained plane, then fit the canvas around every state and loop.
// Clamping a crowded simulation to a fixed rectangle makes collisions unavoidable.
export function createGraphLayout(nodes: Node[], links: { from: string; to: string }[], fontSize: number, size: number, layout: "network" | "circle", spacing = 1): GraphLayout {
  if (!nodes.length) return { nodes: [], width: GRAPH_WIDTH, height: GRAPH_HEIGHT };
  const gap = 45 * spacing;
  const max = Math.max(1, ...nodes.map((n) => n.minutes ?? 0));
  const placed = nodes.map((node) => {
    const lines = wrapLabel(node.name);
    const textWidth = Math.max(...lines.map((l) => l.length)) * fontSize * 0.56;
    const textHeight = (lines.length + 1.5) * fontSize * 1.18;
    const radius = Math.max(Math.sqrt(30 ** 2 + (72 * size) ** 2 * ((node.minutes ?? 0) / max)), Math.hypot(textWidth / 2, textHeight / 2) + 9);
    return { ...node, lines, radius, x: 0, y: 0 };
  });
  const maxRadius = Math.max(...placed.map((n) => n.radius));
  const ringRadius = placed.length === 1 ? 0 : Math.max(250, (2 * maxRadius + gap) / (2 * Math.sin(Math.PI / placed.length)));
  placed.forEach((node, i) => {
    const angle = layout === "circle" ? -Math.PI / 2 + i * 2 * Math.PI / placed.length : i * 2.399963229728653;
    const radius = layout === "circle" ? ringRadius : (2 * maxRadius + gap) * .7 * Math.sqrt(i);
    node.x = radius * Math.cos(angle); node.y = radius * Math.sin(angle);
  });
  if (layout === "network") {
    const index = new Map(placed.map((n, i) => [n.name, i]));
    const pairs = new Map<string, [number, number]>();
    for (const link of links) {
      const a = index.get(link.from)!, b = index.get(link.to)!;
      if (a !== b) pairs.set(JSON.stringify([Math.min(a, b), Math.max(a, b)]), [a, b]);
    }
    const degree = placed.map(() => 0);
    for (const [a, b] of pairs.values()) { degree[a]++; degree[b]++; }
    const velocity = placed.map(() => ({ x: 0, y: 0 }));
    for (let step = 0; step < 550; step++) {
      const forces = placed.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const dx = placed[j].x - placed[i].x, dy = placed[j].y - placed[i].y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const minimum = placed[i].radius + placed[j].radius + gap;
          const push = Math.min(70, 28000 * spacing / distance ** 2 + Math.max(0, minimum - distance) * .6);
          forces[i].x -= dx / distance * push; forces[i].y -= dy / distance * push;
          forces[j].x += dx / distance * push; forces[j].y += dy / distance * push;
        }
      }
      for (const [a, b] of pairs.values()) {
        const dx = placed[b].x - placed[a].x, dy = placed[b].y - placed[a].y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const desired = placed[a].radius + placed[b].radius + gap * 2.4;
        const pull = (distance - desired) * .025 / Math.sqrt(Math.max(degree[a], degree[b], 1));
        forces[a].x += dx / distance * pull; forces[a].y += dy / distance * pull;
        forces[b].x -= dx / distance * pull; forces[b].y -= dy / distance * pull;
      }
      const cooling = .15 + .85 * (1 - step / 550);
      placed.forEach((node, i) => {
        velocity[i].x = (velocity[i].x + forces[i].x - node.x * .001) * .65;
        velocity[i].y = (velocity[i].y + forces[i].y - node.y * .001) * .65;
        node.x += Math.max(-20, Math.min(20, velocity[i].x)) * cooling;
        node.y += Math.max(-20, Math.min(20, velocity[i].y)) * cooling;
      });
    }
    // Resolve remaining collisions explicitly, including labels in large states.
    for (let step = 0; step < 180; step++) {
      let overlap = 0;
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          let dx = placed[j].x - placed[i].x, dy = placed[j].y - placed[i].y;
          let distance = Math.hypot(dx, dy);
          if (distance < .001) { dx = 1; dy = 0; distance = 1; }
          const separation = placed[i].radius + placed[j].radius + gap;
          if (distance >= separation) continue;
          const push = (separation - distance + .02) / 2;
          placed[i].x -= dx / distance * push; placed[i].y -= dy / distance * push;
          placed[j].x += dx / distance * push; placed[j].y += dy / distance * push;
          overlap = Math.max(overlap, separation - distance);
        }
      }
      if (overlap < .05) break;
    }
  }
  const loops = new Set(links.filter((link) => link.from === link.to).map((link) => link.from));
  const minX = Math.min(...placed.map((n) => n.x - n.radius * (loops.has(n.name) ? 1.8 : 1)));
  const maxX = Math.max(...placed.map((n) => n.x + n.radius * (loops.has(n.name) ? 1.8 : 1)));
  const minY = Math.min(...placed.map((n) => n.y - n.radius * (loops.has(n.name) ? 2.2 : 1)));
  const maxY = Math.max(...placed.map((n) => n.y + n.radius));
  const width = Math.max(GRAPH_WIDTH, Math.ceil((maxX - minX + 120) / 10) * 10);
  const height = Math.max(GRAPH_HEIGHT, Math.ceil((maxY - minY + 290) / 10) * 10);
  const offsetX = (width - maxX + minX) / 2 - minX;
  const offsetY = 175 + (height - 290 - maxY + minY) / 2 - minY;
  placed.forEach((node) => {
    node.x = Math.round((node.x + offsetX) * 1000) / 1000;
    node.y = Math.round((node.y + offsetY) * 1000) / 1000;
  });
  return { nodes: placed, width, height };
}

export function layoutNodes(nodes: Node[], links: { from: string; to: string }[], fontSize: number, size: number, layout: "network" | "circle"): PositionedNode[] {
  return createGraphLayout(nodes, links, fontSize, size, layout).nodes;
}

// Export the complete adaptive canvas while keeping raster sizes within browser limits.
export function pngDimensions(width: number, height: number, scale: number): { width: number; height: number } {
  const factor = Math.min(scale, 8192 / Math.max(width, height), Math.sqrt(32000000 / (width * height)));
  return { width: Math.max(1, Math.floor(width * factor)), height: Math.max(1, Math.floor(height * factor)) };
}

export function edgePath(a: PositionedNode, b: PositionedNode, reciprocal: boolean): { path: string; label: Point } {
  if (a.name === b.name) {
    const r = a.radius;
    return { path: `M ${a.x - r * .65} ${a.y - r * .76} C ${a.x - r * 1.7} ${a.y - r * 2.1}, ${a.x + r * 1.7} ${a.y - r * 2.1}, ${a.x + r * .65} ${a.y - r * .76}`, label: { x: a.x, y: a.y - r * 1.8 } };
  }
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.max(1, Math.hypot(dx, dy));
  const bend = reciprocal ? Math.min(85, length * .25) : 22;
  const control = { x: (a.x + b.x) / 2 - dy / length * bend, y: (a.y + b.y) / 2 + dx / length * bend };
  const startDistance = Math.max(1, Math.hypot(control.x - a.x, control.y - a.y));
  const endDistance = Math.max(1, Math.hypot(control.x - b.x, control.y - b.y));
  const start = { x: a.x + (control.x - a.x) / startDistance * (a.radius + 2), y: a.y + (control.y - a.y) / startDistance * (a.radius + 2) };
  const end = { x: b.x + (control.x - b.x) / endDistance * (b.radius + 10), y: b.y + (control.y - b.y) / endDistance * (b.radius + 10) };
  return { path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`, label: { x: .25 * start.x + .5 * control.x + .25 * end.x, y: .25 * start.y + .5 * control.y + .25 * end.y } };
}
