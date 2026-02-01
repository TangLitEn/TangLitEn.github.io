import TimelineSection from "../../components/TimelineSection";

export const metadata = { title: "Timeline — Lit En" };

export default function TimelinePage() {
  return (
    <main style={{ padding: "28px 0 52px" }}>
      <h1 style={{ margin: "0 0 10px" }}>Timeline</h1>
      <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
        Projects, learning arcs, and selected achievements.
      </p>
      <TimelineSection />
    </main>
  );
}
