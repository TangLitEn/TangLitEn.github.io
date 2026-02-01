"use client";

import { useMemo, useState } from "react";
import { TIMELINE, TimelineEntry } from "../data/timeline";
import TimelineToggle from "./TimelineToggle";
import TimelineItem from "./TimelineItem";

type Props = { compact?: boolean };

export default function TimelineSection({ compact }: Props) {
  const [mode, setMode] = useState<"timeline" | "list">("timeline");

  const entries = useMemo(() => {
    const sorted = [...TIMELINE].sort((a, b) => (a.date < b.date ? 1 : -1));
    return compact ? sorted.slice(0, 4) : sorted;
  }, [compact]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <TimelineToggle mode={mode} onChange={setMode} />

      {mode === "timeline" ? (
        <div style={{ display: "grid", gap: 12 }}>
          {entries.map((e) => (
            <TimelineItem key={`${e.date}-${e.title}`} entry={e} variant="timeline" />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: 14
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10 }}>
            {entries.map((e) => (
              <li key={`${e.date}-${e.title}`}>
                <b>{e.title}</b>{" "}
                <span style={{ color: "rgba(255,255,255,0.65)" }}>({e.date})</span>
                <div style={{ color: "rgba(255,255,255,0.75)" }}>{e.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
