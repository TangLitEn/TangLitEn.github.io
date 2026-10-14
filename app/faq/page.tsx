import Link from "next/link";
import PageIntro from "../../components/PageIntro";
import { FAQ } from "../../data/faq";
import styles from "./faq.module.css";

export const metadata = {
  title: "FAQ",
  description: "Answers about Lit En’s notebook, life checkpoints, travel memories, and getting in touch.",
  alternates: { canonical: "/faq/" },
};

export default function FAQPage() {
  return <main id="main-content" className="page">
    <PageIntro className="page-heading">
      <p className="eyebrow">QUESTIONS & ANSWERS</p>
      <h1>FAQ<span className="accent">.</span></h1>
      <p>A few answers about this notebook and how to get in touch.</p>
    </PageIntro>
    <section className={styles.questions} aria-label="Frequently asked questions">
      {FAQ.map((item) => <details className={styles.question} key={item.question}>
        <summary>{item.question}<span className={styles.toggle} aria-hidden="true">+</span></summary>
        <div className={styles.answer}>
          <p>{item.answer}</p>
          <Link href={item.link.href}>{item.link.label} <span aria-hidden="true">↗</span></Link>
        </div>
      </details>)}
    </section>
  </main>;
}
