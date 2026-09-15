"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./flags.module.css";
import type { Badge } from "../../lib/badges";

export default function FlagCollection({ badges }: { badges: Badge[] }) {
  const [expanded, setExpanded] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<{ invalidate: () => void; dispose: () => void } | null>(null);
  const working = badges.filter((badge) => badge.status === "wip");
  const earned = badges.filter((badge) => badge.status === "earned");
  const ordered = [...working, ...earned];

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      import("./FlagScene").then(({ createFlagScene }) => {
        if (!disposed) controller.current = createFlagScene(element, badges);
      }).catch(() => { /* Static banner artwork remains available without WebGL. */ });
    }, { rootMargin: "150px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); controller.current?.dispose(); controller.current = null; };
  }, [badges, expanded]);

  function renderFlag(badge: Badge, marquee = false) {
    const month = badge.achieved ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${badge.achieved}-01T00:00:00Z`)) : null;
    const content = <>
      <div className={`flag-slot ${badge.status === "wip" ? "flag-wip" : ""}`} data-flag-slot data-flag-id={badge.id} aria-hidden="true">
        <div className="flag-fallback"><Image src={badge.image} alt="" width={240} height={400} /></div>
      </div>
      {!marquee && <div className="flag-caption">
        <span className="flag-name">{badge.name}</span>
        {badge.status === "earned" && month && <time className="flag-date" dateTime={badge.achieved!}>{month}</time>}
      </div>}
    </>;
    return badge.status === "earned"
      ? <Link className="flag-card" href={`/about/?view=badges#badge-${badge.id}`} tabIndex={marquee ? -1 : undefined} aria-label={`${badge.name}${month ? `, achieved ${month}` : ""}: view ${badge.checkpoints.length} ${badge.checkpoints.length === 1 ? "checkpoint" : "checkpoints"}`} key={badge.id}>{content}</Link>
      : <article className="flag-card flag-card-wip" aria-label={`${badge.name}: work in progress`} key={badge.id}>{content}</article>;
  }

  return <div className={`${styles.exhibit} flag-exhibit ${expanded ? "flags-expanded" : "flags-collapsed"}`}>
    <div className="flag-strip-toolbar">
      <button type="button" className="flag-expand" aria-expanded={expanded} aria-controls="honours-flags" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Collapse flags" : "Show all flags"}<span className="flag-chevron" aria-hidden="true">⌄</span>
      </button>
    </div>
    <div id="honours-flags" className={`${styles.stage} flag-stage`} ref={host}>
      {expanded ? <div className="flag-expanded-groups">
        {!!working.length && <section className="flag-status-group" aria-labelledby="wip-flags-heading"><h2 id="wip-flags-heading" className="eyebrow">WIP flags</h2><div className="flag-shelf">{working.map((badge) => renderFlag(badge))}</div></section>}
        {!!earned.length && <section className="flag-status-group" aria-labelledby="collected-flags-heading"><h2 id="collected-flags-heading" className="eyebrow">Collected flags</h2><div className="flag-shelf">{earned.map((badge) => renderFlag(badge))}</div></section>}
      </div> : <div className="flag-marquee" aria-hidden="true">
        <div className="flag-marquee-track">{[0, 1].map((copy) => <div className="flag-marquee-copy" key={copy}>{ordered.map((badge) => renderFlag(badge, true))}</div>)}</div>
      </div>}
    </div>
  </div>;
}
