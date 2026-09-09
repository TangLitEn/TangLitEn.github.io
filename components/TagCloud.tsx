"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createCloudSimulation, dragCloudBubble, stepCloudSimulation, type CloudSimulation, type CloudTag } from "../lib/tag-cloud";

type Drag = { index: number; pointerId: number; startX: number; startY: number; x: number; y: number; targetX: number; targetY: number; moved: boolean };

export default function TagCloud({ tags, label }: { tags: CloudTag[]; label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef<number | null>(null);
  const simulation = useRef<CloudSimulation | null>(null);
  const wake = useRef<() => void>(() => {});
  const [layout, setLayout] = useState<CloudSimulation | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [rearranged, setRearranged] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let previousWidth = 0;
    let frame = 0;
    let previousTime = 0;
    let quietFrames = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function publish(next: CloudSimulation) {
      simulation.current = next;
      setLayout(next);
    }

    function tick(time: number) {
      frame = 0;
      const previous = simulation.current;
      if (!previous) return;
      const dt = previousTime ? (time - previousTime) / 1000 : 1 / 60;
      previousTime = time;
      const held = drag.current;
      const dragged = held?.moved ? dragCloudBubble(previous, { index: held.index, x: held.targetX, y: held.targetY }) : previous;
      const next = stepCloudSimulation(dragged, dt, held?.index ?? -1);
      const movement = next.bubbles.reduce((max, body, index) => Math.max(max, Math.hypot(body.x - previous.bubbles[index].x, body.y - previous.bubbles[index].y)), 0);
      publish(next);
      quietFrames = movement < 0.015 ? quietFrames + 1 : 0;
      if (quietFrames < 20) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    }

    function wakeSimulation() {
      quietFrames = 0;
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        // Keep collision-safe dragging, but settle on release without animation.
        if (!drag.current && simulation.current) {
          let next = simulation.current;
          for (let i = 0; i < 240; i++) next = stepCloudSimulation(next, 1 / 60);
          publish(next);
        }
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }
    wake.current = wakeSimulation;
    reducedMotion.addEventListener("change", wakeSimulation);
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      if (!width || width === previousWidth) return;
      previousWidth = width;
      drag.current = null;
      setActive(null);
      publish(createCloudSimulation(tags, width));
      setRearranged(false);
      wakeSimulation();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", wakeSimulation);
      wake.current = () => {};
    };
  }, [tags]);

  function startDrag(event: PointerEvent<HTMLAnchorElement>, index: number) {
    if (!simulation.current || event.button !== 0 || !event.isPrimary || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const bubble = simulation.current.bubbles[index];
    suppressClick.current = null;
    drag.current = { index, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: bubble.x, y: bubble.y, targetX: bubble.x, targetY: bubble.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    wake.current();
  }

  function moveDrag(event: PointerEvent<HTMLAnchorElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || !stage.current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < 6) return;
    current.moved = true;
    current.targetX = current.x + dx;
    current.targetY = current.y + dy;
    suppressClick.current = current.index;
    setActive(current.index);
    setRearranged(true);
    if (simulation.current) {
      simulation.current = dragCloudBubble(simulation.current, { index: current.index, x: current.targetX, y: current.targetY });
      setLayout(simulation.current);
    }
    wake.current();
  }

  function endDrag(event: PointerEvent<HTMLAnchorElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setActive(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    wake.current();
  }

  function reset() {
    if (!stage.current) return;
    simulation.current = createCloudSimulation(tags, stage.current.clientWidth);
    setLayout(simulation.current);
    setRearranged(false);
    suppressClick.current = null;
    wake.current();
  }

  return <div className="tag-cloud">
    <div className="tag-cloud-toolbar">
      <button className="tag-cloud-reset" type="button" onClick={reset} disabled={!rearranged} aria-label={`Reset ${label.toLowerCase()} bubble positions`}>Reset positions <span aria-hidden="true">↺</span></button>
    </div>
    <div ref={stage} className={`tag-cloud-stage${layout ? " is-positioned" : ""}`} style={layout ? { height: layout.height } : undefined} role="group" aria-label={`${label} tags`}>
      {tags.map((tag, index) => {
        const bubble = layout?.bubbles[index];
        const style: CSSProperties = bubble ? { width: bubble.size, height: bubble.size, left: bubble.x, top: bubble.y, fontSize: bubble.fontSize } : {};
        return <Link
          key={tag.label}
          href={tag.href}
          className={`tag-bubble tag-bubble-tone-${index % 4}${active === index ? " is-dragging" : ""}`}
          style={style}
          aria-label={`${tag.label}, ${tag.count} ${tag.count === 1 ? "entry" : "entries"}. Explore ${label.toLowerCase()} timeline`}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          onPointerDown={(event) => startDrag(event, index)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onClick={(event) => {
            if (suppressClick.current === index && event.detail !== 0) event.preventDefault();
            suppressClick.current = null;
          }}
        >
          <span className="tag-bubble-word">{tag.label.split(/(?=@)/).map((part, partIndex) => <span key={partIndex}>{partIndex > 0 && <wbr />}{part}</span>)}</span>
          <span className="tag-bubble-count">{tag.count} {tag.count === 1 ? "entry" : "entries"}</span>
        </Link>;
      })}
    </div>
  </div>;
}
