import Link from "next/link";
export default function NotFound() {
  return <main id="main-content" className="page narrow-page"><div className="page-heading"><p className="eyebrow">404 · A LOOSE LEAF</p><h1>This page is missing.</h1><p>Let’s find your way back to the notebook.</p><Link className="underlined-link" href="/">All posts →</Link></div></main>;
}
