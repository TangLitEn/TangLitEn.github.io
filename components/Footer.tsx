export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.10)",
        padding: "22px 0",
        color: "rgba(255,255,255,0.55)"
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 18px", fontSize: 13 }}>
        © {new Date().getFullYear()} Lit En · Built with Next.js · Static export for GitHub Pages
      </div>
    </footer>
  );
}
