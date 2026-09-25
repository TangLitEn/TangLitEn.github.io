import Link from "next/link";

export const metadata = {
  title: "Checkpoint",
  alternates: { canonical: "/checkpoints/" },
  robots: { index: false, follow: true },
};

// A static redirect also works on GitHub Pages, without a server or JavaScript.
export default function LegacyTimelinePage() {
  return <main id="main-content" className="page narrow-page">
    <meta httpEquiv="refresh" content="0;url=/checkpoints/" />
    <div className="page-heading"><h1>Life checkpoints have moved.</h1><p>Find the stories on the Checkpoint page.</p></div>
    <Link className="underlined-link" href="/checkpoints/">Continue to Checkpoint →</Link>
  </main>;
}
