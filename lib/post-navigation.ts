const sourceKey = (pathname: string) => `post-source:${pathname.replace(/\/$/, "")}`;

export function rememberPostSource(destinationHref: string, sourceHref: string) {
  const destination = new URL(destinationHref, sourceHref);
  const source = new URL(sourceHref);
  if (destination.origin !== source.origin || !/^\/blog\/[^/]+\/?$/.test(destination.pathname)) return;
  // In-post anchors and simulator changes must not replace the originating page.
  if (destination.pathname.replace(/\/$/, "") === source.pathname.replace(/\/$/, "")) return;
  try {
    sessionStorage.setItem(sourceKey(destination.pathname), source.pathname + source.search + source.hash);
  } catch { /* The default return link remains available when storage is blocked. */ }
}

export function getPostReturnHref(slug: string, fallback = "/#posts") {
  try {
    const saved = sessionStorage.getItem(sourceKey(`/blog/${slug}`));
    if (!saved) return fallback;
    const destination = new URL(saved, window.location.origin);
    if (destination.origin !== window.location.origin || destination.pathname.replace(/\/$/, "") === `/blog/${slug}`) return fallback;
    return destination.pathname + destination.search + destination.hash;
  } catch {
    return fallback;
  }
}
