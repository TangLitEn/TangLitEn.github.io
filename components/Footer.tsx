import { CONTACT } from "../data/contact";

export default function Footer() {
  return <footer className="site-footer">
    <div><span>© {new Date().getFullYear()} Lit En</span><span className="footer-note">Always a work in progress.</span></div>
    <div><a href={`mailto:${CONTACT.email}`}>Email ↗</a>{CONTACT.links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener">{link.label} ↗</a>)}</div>
  </footer>;
}
