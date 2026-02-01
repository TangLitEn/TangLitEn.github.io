import { CONTACT } from "../../data/contact";

export const metadata = { title: "Contact — Lit En" };

export default function ContactPage() {
  return (
    <main style={{ padding: "28px 0 52px" }}>
      <h1 style={{ margin: "0 0 10px" }}>Contact</h1>
      <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
        Best way to reach me: email. I’m also around on these platforms.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: 18
        }}
      >
        <div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Email</div>
          <a href={`mailto:${CONTACT.email}`} style={{ fontSize: 16 }}>
            {CONTACT.email}
          </a>
        </div>
        

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {CONTACT.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "8px 10px",
                borderRadius: 999
              }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
