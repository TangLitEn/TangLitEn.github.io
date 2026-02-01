"use client";

export default function Hero() {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img
          src="/avatar.png"
          alt="Avatar"
          width={56}
          height={56}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            objectFit: "cover"
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>
            Building systems that compound
          </h1>
          <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)" }}>
            Semiconductors · Learning platforms · Life optimization
          </div>
        </div>
      </div>

      {/* ...rest unchanged... */}
    </section>
  );
}
