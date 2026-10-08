import type { ReactNode } from "react";
import LogoMarquee, { type MarqueeEntry } from "./LogoMarquee";
import styles from "./MarqueeSection.module.css";

type Props = {
  title: string;
  label: string;
  entries: MarqueeEntry[];
  expandLabel?: string;
  children?: ReactNode;
};

export default function MarqueeSection({ title, label, entries, expandLabel, children }: Props) {
  if (!entries.length) return null;
  return <section className={styles.section} aria-label={title}>
    {children ? <details className={styles.details}>
      <summary>
        <span className={styles.heading}>{title}</span>
        <span className={styles.toggle}>
          <span className={styles.show}>{expandLabel ?? "See all"}</span>
          <span className={styles.hide}>Show less</span>
          <span className={styles.chevron} aria-hidden="true">⌄</span>
        </span>
      </summary>
      {children}
    </details> : <div className={styles.headingRow}><h2 className={styles.heading}>{title}</h2></div>}
    <LogoMarquee entries={entries} label={label} />
  </section>;
}
