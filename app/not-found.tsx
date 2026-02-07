import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "28px 0 52px" }}>
      <h1 style={{ margin: 0 }}>404</h1>
      <p style={{ color: "rgba(255,255,255,0.65)" }}>
        Page not found.
      </p>
      <Link href="/">Go home →</Link>
    </main>
  );
}
