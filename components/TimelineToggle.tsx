type Props = {
  mode: "timeline" | "list";
  onChange: (m: "timeline" | "list") => void;
};

export default function TimelineToggle({ mode, onChange }: Props) {
  const chip = (active: boolean): React.CSSProperties => ({
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
    cursor: "pointer",
    userSelect: "none"
  });

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>View</div>
      <div onClick={() => onChange("timeline")} style={chip(mode === "timeline")}>
        Timeline
      </div>
      <div onClick={() => onChange("list")} style={chip(mode === "list")}>
        List
      </div>
    </div>
  );
}
