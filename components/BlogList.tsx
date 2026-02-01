import { PostMeta } from "../lib/posts";

export default function BlogList({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) {
    return (
      <div style={{ color: "rgba(255,255,255,0.65)" }}>
        No posts yet. Add Markdown files under <code>content/blog</code>.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {posts.map((p) => (
        <a
          key={p.slug}
          href={`/blog/${p.slug}/`}
          style={{
            display: "block",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: 14
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700 }}>{p.title}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{p.date}</div>
          </div>

          {p.description ? (
            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.78)" }}>{p.description}</div>
          ) : null}

          {p.tags?.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {p.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "4px 8px",
                    borderRadius: 999
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </a>
      ))}
    </div>
  );
}
