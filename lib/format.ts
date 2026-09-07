export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("en", {
    month: short ? "short" : "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function tagSlug(tag: string) {
  return encodeURIComponent(tag.toLowerCase());
}
