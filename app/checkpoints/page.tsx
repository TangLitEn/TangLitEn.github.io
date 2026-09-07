import Link from "next/link";

export const metadata = {
  title: "About",
  alternates: { canonical: "/about/" },
  robots: { index: false, follow: true },
};

// A static redirect also works on GitHub Pages, without a server or JavaScript.
export default function LegacyCheckpointsPage() {
  return (
    <main id="main-content" className="page narrow-page">
      <meta httpEquiv="refresh" content="0;url=/about/#checkpoints" />
      <div className="page-heading">
        <h1>Life checkpoints have moved.</h1>
        <p>They’re now part of my About page.</p>
      </div>
      <Link className="underlined-link" href="/about/#checkpoints">Continue to About →</Link>
    </main>
  );
}
