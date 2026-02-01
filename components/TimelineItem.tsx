import { TimelineEntry } from "../data/timeline";

export default function TimelineItem({
  entry,
  variant
}: {
  entry: TimelineEntry;
  variant: "timeline" | "list";
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 12,
        alignItems: "start",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 14,
        padding: 14
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
        <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{entry.date}</div>
        <div style={{ marginTop: 6 }}>{entry.kind}</div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          {entry.title}{" "}
          {entry.org ? (
            <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>· {entry.org}</span>
          ) : null}
        </div>

        <div style={{ color: "rgba(255,255,255,0.78)" }}>{entry.description}</div>

        {entry.tags?.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {entry.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "4px 8px",
                  borderRadius: 999
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
