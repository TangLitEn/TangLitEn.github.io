export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#f3f3f2",
        color: "#111",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 640,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          👋 Hi, I’m Lit En YAY 3
        </h1>

        <p style={{ fontSize: 18, opacity: 0.8 }}>
          Builder of TINKRR & Learnr
        </p>

        <hr style={{ margin: "24px 0" }} />

        <p>
          This is a <b>static Next.js site</b> hosted on GitHub Pages.
        </p>

        <ul style={{ lineHeight: 1.8 }}>
          <li>🚀 Testing static deployment</li>
          <li>🧱 No backend</li>
          <li>📦 Zero cost hosting</li>
        </ul>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <a
            href="https://github.com"
            target="_blank"
            style={buttonStyle}
          >
            GitHub
          </a>
          <a
            href="#"
            style={buttonStyleSecondary}
          >
            TINKRR (soon)
          </a>
        </div>
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: 10,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
};

const buttonStyleSecondary: React.CSSProperties = {
  ...buttonStyle,
  background: "#e5e5e5",
  color: "#111",
};
