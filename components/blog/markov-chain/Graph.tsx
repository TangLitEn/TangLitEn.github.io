"use client";

import { useRef, useState, type PointerEvent, type RefObject } from "react";
import type { Edge } from "../../../lib/markov-chain/data";
import { edgePath, wrapLabel, type GraphLayout, type Point } from "../../../lib/markov-chain/graph";

export type Appearance = {
  title: string; fontSize: number; edgeFontSize: number; titleSize: number; edgeSize: number;
  nodeSize: number; spacing: number; nodeColor: string; edgeColor: string; textColor: string; background: string;
  layout: "network" | "circle"; labels: "probability" | "count" | "both" | "none";
  labelDisplay: "auto" | "all";
};

export const defaultAppearance: Appearance = {
  title: "Online learning · Synthetic example", fontSize: 16, edgeFontSize: 14, titleSize: 28,
  edgeSize: 1, nodeSize: 1, spacing: 1, nodeColor: "#e4ecdc", edgeColor: "#61754e",
  textColor: "#292d28", background: "#ffffff", layout: "network", labels: "probability", labelDisplay: "auto",
};

export default function Graph({ graph, edges, appearance: a, svgRef, instanceId, resetKey, focus = "", onFocus }: {
  graph: GraphLayout; edges: Edge[]; appearance: Appearance; svgRef: RefObject<SVGSVGElement | null>; instanceId: string; resetKey: number;
  focus?: string; onFocus?: (state: string) => void;
}) {
  const { nodes, width, height } = graph;
  const [dragged, setDragged] = useState<{ key: string; points: Record<string, Point> }>({ key: "", points: {} });
  const dragging = useRef<{ name: string; x: number; y: number; moved: boolean } | null>(null);
  const didDrag = useRef(false);
  const key = JSON.stringify([graph, resetKey]);
  const positions = nodes.map((n) => ({ ...n, ...(dragged.key === key ? dragged.points[n.name] : {}) }));
  const byName = new Map(positions.map((n) => [n.name, n]));
  const pairs = new Set(edges.map((e) => JSON.stringify([e.from, e.to])));
  const connected = new Set([focus]);
  edges.forEach((edge) => { if (edge.from === focus || edge.to === focus) { connected.add(edge.from); connected.add(edge.to); } });
  const overviewLabels = a.labelDisplay === "all" || edges.length <= 20;
  const marker = `${instanceId}-arrow`;
  function move(event: PointerEvent<SVGSVGElement>) {
    if (!dragging.current || !svgRef.current) return;
    if (Math.hypot(event.clientX - dragging.current.x, event.clientY - dragging.current.y) > 4) {
      dragging.current.moved = true; didDrag.current = true;
    }
    if (!dragging.current.moved) return;
    const matrix = svgRef.current.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const node = byName.get(dragging.current.name)!;
    const selfLoop = pairs.has(JSON.stringify([node.name, node.name]));
    const horizontal = node.radius * (selfLoop ? 1.8 : 1) + 35;
    const top = node.radius * (selfLoop ? 2.2 : 1) + 155;
    const position = { x: Math.max(horizontal, Math.min(width - horizontal, point.x)), y: Math.max(top, Math.min(height - node.radius - 115, point.y)) };
    setDragged((previous) => ({ key, points: { ...(previous.key === key ? previous.points : {}), [node.name]: position } }));
  }
  const titleLines = wrapLabel(a.title, 65).slice(0, 3);
  const titleSize = Math.min(a.titleSize, 1110 / Math.max(1, ...titleLines.map((line) => line.length * .62)));
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}
    aria-label={`${a.title || "Markov chain"}: ${nodes.length} states and ${edges.length} directed transitions. Select a state to focus its connections or drag it to rearrange; the tables below provide the data.`}
    role="group" onPointerMove={move} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; didDrag.current = true; }}
    style={{ display: "block", width: "100%", height: "auto", fontFamily: "Arial, sans-serif" }}>
    <rect width={width} height={height} fill={a.background} />
    <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 z" fill={a.edgeColor} /></marker></defs>
    <text x="45" y="52" fill={a.textColor} fontSize={titleSize} fontWeight="600">{titleLines.map((line, i) => <tspan key={i} x="45" dy={i ? titleSize * 1.1 : 0}>{line}</tspan>)}</text>
    <text data-focus-caption="true" opacity={focus ? 1 : 0} x="45" y="155" fill={a.textColor} fontSize="13">{focus ? `Focus: ${focus} · Other connections are faded` : ""}</text>
    {edges.map((edge) => {
      const { path } = edgePath(byName.get(edge.from)!, byName.get(edge.to)!, pairs.has(JSON.stringify([edge.to, edge.from])));
      const related = !focus || edge.from === focus || edge.to === focus;
      return <path data-transition="true" data-from={edge.from} data-to={edge.to} key={JSON.stringify([edge.from, edge.to])} d={path} stroke={a.edgeColor} strokeWidth={a.edgeSize * (0.8 + 6 * edge.probability)} fill="none" opacity={related ? .7 : .08} markerEnd={`url(#${marker})`}><title>{`${edge.from} → ${edge.to}: P(next) = ${edge.probability.toFixed(3)}; count = ${edge.count ?? "not supplied"}`}</title></path>;
    })}
    {a.labels !== "none" && edges.map((edge) => {
      const { label } = edgePath(byName.get(edge.from)!, byName.get(edge.to)!, pairs.has(JSON.stringify([edge.to, edge.from])));
      const value = a.labels === "count" ? String(edge.count ?? "—") : a.labels === "both" ? `${edge.probability.toFixed(2)} · n=${edge.count ?? "—"}` : edge.probability.toFixed(2);
      const visible = focus ? edge.from === focus || edge.to === focus : overviewLabels;
      return <text data-edge-label="true" data-from={edge.from} data-to={edge.to} data-overview-opacity={overviewLabels ? "1" : "0"} opacity={visible ? 1 : 0} pointerEvents="none" aria-hidden={!visible} key={JSON.stringify([edge.from, edge.to])} x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize={a.edgeFontSize} fill={a.textColor} stroke={a.background} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">{value}</text>;
    })}
    {positions.map((node) => <g data-state={node.name} opacity={!focus || connected.has(node.name) ? 1 : .35} key={node.name}
      role={onFocus ? "button" : undefined} tabIndex={onFocus ? 0 : undefined} aria-label={onFocus ? `Focus connections for ${node.name}` : undefined} aria-pressed={onFocus ? focus === node.name : undefined}
      style={{ cursor: "grab", touchAction: "none" }} onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault(); didDrag.current = false;
        dragging.current = { name: node.name, x: event.clientX, y: event.clientY, moved: false }; event.currentTarget.setPointerCapture(event.pointerId);
      }} onClick={() => { if (!didDrag.current) onFocus?.(focus === node.name ? "" : node.name); }} onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onFocus?.(focus === node.name ? "" : node.name); }
      }}>
      <title>{`${node.name}: ${node.minutes === null ? "no matched time data" : `${node.minutes.toFixed(1)} minutes`}${node.users === null ? "" : `, ${node.users} users`}`}</title>
      <circle cx={node.x} cy={node.y} r={node.radius} fill={node.minutes === null ? a.background : a.nodeColor} stroke={a.edgeColor} strokeWidth={focus === node.name ? 4 : 1.6} strokeDasharray={node.minutes === null ? "5 4" : undefined} />
      <text x={node.x} y={node.y - (node.lines.length - 1) * a.fontSize * .59 - a.fontSize * .35} textAnchor="middle" fill={a.textColor} fontSize={a.fontSize}>
        {node.lines.map((line, i) => <tspan key={i} x={node.x} dy={i ? a.fontSize * 1.18 : 0}>{line}</tspan>)}
        <tspan x={node.x} dy={a.fontSize * 1.6} fontSize={a.fontSize * .78}>{node.minutes === null ? "Time not mapped" : `${node.minutes.toFixed(1)} min`}</tspan>
      </text>
    </g>)}
  </svg>;
}
