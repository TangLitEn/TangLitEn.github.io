import Image from "next/image";
import Link from "next/link";
import MusicPlayer from "./MusicPlayer";

export default function NavBar() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(11,12,16,0.65)",
        borderBottom: "1px solid rgba(255,255,255,0.10)"
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link
            href="/"
            style={{ fontWeight: 700, letterSpacing: 0.2, display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            <Image
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
          </Link>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <MusicPlayer />
          </div>
        </div>
      </div>
    </div>
  );
}
