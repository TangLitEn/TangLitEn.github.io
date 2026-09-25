export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("en", {
    month: short ? "short" : "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function tagSlug(tag: string) {
  return encodeURIComponent(tag.toLowerCase());
}

export function formatAchievementDate(date: string) {
  if (date.length === 4) return date;
  const full = date.length === 7 ? `${date}-01` : date;
  return new Intl.DateTimeFormat("en-GB", {
    ...(date.length === 10 ? { day: "numeric" as const } : {}),
    month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${full}T00:00:00Z`));
}

export function timelineHref(tag: string, checkpoint = false) {
  if (checkpoint) return "/checkpoints/";
  return `/?tag=${encodeURIComponent(tag)}#posts`;
}
