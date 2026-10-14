import Link from "next/link";

export const metadata = {
  title: "About",
  alternates: { canonical: "/about/" },
  robots: { index: false, follow: true },
};

// GitHub Pages supports this static redirect without a server.
export default function LegacyCheckpointPage() {
  return <main id="main-content" className="page narrow-page">
    <meta httpEquiv="refresh" content="0;url=/about/#biography" />
    <div className="page-heading"><h1>Life checkpoints are now part of About.</h1><p>Click a note number in the biography to read its story and see the photos.</p></div>
    <Link className="underlined-link" href="/about/#biography">Continue to About →</Link>
  </main>;
}
