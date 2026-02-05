const linkStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)"
};

export default function NavBar() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(11,12,16,0.65)",
        borderBottom: "1px solid rgba(255,255,255,0.10)"
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <a
            href="/"
            style={{ fontWeight: 700, letterSpacing: 0.2, display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            <img
              src="/personal_logo.jpg"
              alt="Lit En logo"
              width={28}
              height={28}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                objectFit: "cover"
              }}
            />
            Lit En
          </a>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }} />
        </div>
      </div>
    </div>
  );
}
