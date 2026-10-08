import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LogoMarquee.module.css";

export type MarqueeEntry = { id: string; name: string; image: string; href?: string; content?: ReactNode };
export const MIN_MARQUEE_ITEMS = 8;

export default function LogoMarquee({ entries, label }: { entries: MarqueeEntry[]; label: string }) {
  if (!entries.length) return null;
  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.id, entry])).values());
  const animated = uniqueEntries.length >= MIN_MARQUEE_ITEMS;
  // Only animated strips need copies to fill the viewport and join seamlessly.
  const copies = animated ? Math.max(1, Math.ceil(12 / uniqueEntries.length)) : 1;
  return <div className={`${styles.marquee} ${animated ? styles.animated : styles.static}`} role="region" aria-label={label} tabIndex={0} data-marquee data-animated={animated}>
    <div className={styles.track}>
      {(animated ? [false, true] : [false]).map((duplicate) => <ul className={styles.group} key={String(duplicate)} aria-hidden={duplicate || undefined}>
        {Array.from({ length: copies }, (_, copy) => uniqueEntries.map((entry) => <li key={`${copy}-${entry.id}`} aria-hidden={copy > 0 || undefined}>
          {entry.href ? <Link className={styles.item} href={entry.href} title={entry.name} aria-label={entry.name} tabIndex={duplicate || copy > 0 ? -1 : undefined}>
            {entry.content ?? <Image src={entry.image} alt="" width={64} height={64} />}
          </Link> : <span className={styles.item} title={entry.name}>
            {entry.content ?? <Image src={entry.image} alt={entry.name} width={64} height={64} />}
          </span>}
        </li>))}
      </ul>)}
    </div>
  </div>;
}
