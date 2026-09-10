"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SearchEntry } from "../lib/posts";

export default function NavBar({ entries }: { entries: SearchEntry[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [returnPages, setReturnPages] = useState<Record<string, string>>({});
  const header = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = words.length ? entries.filter((entry) => words.every((word) => entry.searchText.includes(word))) : [];
  const results = matches.slice(0, 8);
  const post = entries.find((entry) => pathname.replace(/\/$/, "") === `/blog/${entry.slug}`);
  const returnHref = returnPages[pathname.replace(/\/$/, "")] ?? (post?.checkpoint ? "/about/#checkpoints" : "/");
  const returnLabel = returnHref.startsWith("/about") ? "Back to about"
    : returnHref.startsWith("/tags") ? "Back to tags"
    : returnHref.startsWith("/blog/") ? "Back to previous post"
    : "Back to the notebook";

  useEffect(() => {
    // Remember the complete source URL before Next handles a post link.
    // Linking to it explicitly also works after following anchors within a post.
    const rememberSource = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download") || link.classList.contains("post-header-back")) return;
      const destination = new URL(link.href);
      if (destination.origin !== window.location.origin || !destination.pathname.startsWith("/blog/")) return;
      const key = destination.pathname.replace(/\/$/, "");
      if (key === window.location.pathname.replace(/\/$/, "")) return;
      const source = window.location.pathname + window.location.search + window.location.hash;
      setReturnPages((pages) => ({ ...pages, [key]: source }));
    };
    document.addEventListener("click", rememberSource, true);
    return () => document.removeEventListener("click", rememberSource, true);
  }, []);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    // Keep anchor targets below the header, including after text zoom or rotation.
    const updateHeight = () => {
      document.documentElement.style.setProperty("--header-height", `${element.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable;
      if (!input.current) return;
      if (((event.metaKey || event.ctrlKey) && event.key === "k") || (event.key === "/" && !editing)) {
        event.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOutside = (event: PointerEvent) => {
      if (!search.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, []);

  useEffect(() => {
    if (open && active >= 0) search.current?.querySelector(`#search-result-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const isCheckpoint = pathname.startsWith("/blog/") && entries.some((entry) =>
    entry.checkpoint && pathname.replace(/\/$/, "") === `/blog/${entry.slug}`
  );
  const links = [
    { href: "/", label: "Posts", current: pathname === "/" || (pathname.startsWith("/blog/") && !isCheckpoint) },
    { href: "/tags/", label: "Tags", current: pathname.startsWith("/tags/") },
    { href: "/about/", label: "About", current: pathname === "/about/" || isCheckpoint },
  ];

  return (
    <header ref={header} className={`site-header${post ? " post-header" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Lit En home">
          <Image src="/lien-logo.png" alt="LIEN" width={70} height={51} priority className="wordmark-logo" />
        </Link>
        {post ? <>
          <p className="post-header-title">{post.title}</p>
          <Link href={returnHref} className="post-header-back">
            {returnLabel} <span aria-hidden="true">↗</span>
          </Link>
        </> : <><nav className="main-nav" aria-label="Main navigation">
          {links.map(({ href, label, current }) => <Link key={href} href={href} aria-current={current ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="header-search" ref={search} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}>
          <div className="search-input-wrap">
            <span className="search-icon" aria-hidden="true" />
            <input ref={input} type="search" placeholder="Search everything…" aria-label="Search posts and checkpoints"
              role="combobox" aria-expanded={open && words.length > 0} aria-controls={open && words.length > 0 ? "search-results" : undefined} aria-autocomplete="list"
              aria-activedescendant={open && active >= 0 ? `search-result-${active}` : undefined}
              value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1); }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault(); setOpen(true);
                  setActive((index) => results.length ? (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : -1);
                }
                if (event.key === "Enter" && results.length) {
                  event.preventDefault();
                  const link = search.current?.querySelector<HTMLAnchorElement>(`#search-result-${Math.max(0, active)} a`);
                  link?.click();
                }
              }} />
            <kbd aria-hidden="true">/</kbd>
          </div>
          {open && words.length > 0 && <div className="search-popover">
            <p className="search-status" role="status">{matches.length ? `${matches.length} result${matches.length === 1 ? "" : "s"}${matches.length > 8 ? " · showing first 8" : ""}` : `No results for “${query}”`}</p>
            <ul id="search-results" role="listbox" aria-label="Search results">
              {results.map((entry, index) => <li id={`search-result-${index}`} key={entry.slug} role="option" aria-selected={active === index}>
                <Link href={`/blog/${entry.slug}/`} onClick={() => { setOpen(false); input.current?.blur(); }}>
                  <strong>{entry.title}</strong><span>{entry.checkpoint ? "Life checkpoint" : "Notebook"} · {entry.date.slice(0, 4)} · {entry.tags.join(" / ")}</span>
                </Link>
              </li>)}
            </ul>
            {!matches.length && <p className="search-hint">Try a topic, project, or a word from a post.</p>}
          </div>}
        </div></>}
      </div>
    </header>
  );
}
