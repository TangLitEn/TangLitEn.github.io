export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("en", {
    month: short ? "short" : "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function tagSlug(tag: string) {
  return encodeURIComponent(tag.toLowerCase());
}

export function timelineHref(tag: string, checkpoint = false) {
  const path = checkpoint ? "/about/" : "/";
  const anchor = checkpoint ? "checkpoints" : "posts";
  return `${path}?tag=${encodeURIComponent(tag)}#${anchor}`;
}
