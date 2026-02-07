import Image from "next/image";
import { PostMeta } from "../lib/posts";

export default function TimelineItem({
  post,
  onOpenImage
}: {
  post: PostMeta;
  onOpenImage?: (src: string, alt?: string) => void;
}) {
  return (
    <a
      href={`/blog/${post.slug}/`}
      className={`timeline-card ${post.image ? "has-image" : "no-image"}`}
    >
      {post.image ? (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenImage?.(post.image as string, post.title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onOpenImage?.(post.image as string, post.title);
            }
          }}
          className="timeline-card-media"
        >
          <div className="timeline-card-media-frame">
            <Image
              src={post.image}
              alt={post.title}
              className="timeline-card-media-image"
              fill
              sizes="(max-width: 768px) 100vw, 160px"
            />
          </div>
        </div>
      ) : null}

      <div className="timeline-card-body">
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{post.date}</div>

        <div style={{ fontWeight: 700, fontSize: 16 }}>{post.title}</div>

        {post.description ? (
          <div style={{ color: "rgba(255,255,255,0.78)" }}>{post.description}</div>
        ) : null}

        {post.tags?.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            {post.tags.map((t) => (
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
      </div>
    </a>
  );
}
