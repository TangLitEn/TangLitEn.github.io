"use client";

import ImageSlider from "./ImageSlider";
import { CONTACT } from "../data/contact";

export default function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-copy">
        <div className="lp-profile">
          <div className="lp-profile-avatar-wrap">
            <img
              src="/avatar.png"
              alt="Avatar"
              width={180}
              height={180}
              className="lp-profile-avatar"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="lp-profile-name">Lit En</div>
          <div className="lp-profile-handle">TangLitEn</div>
          <div className="lp-profile-bio">Building systems that compound</div>
          <div className="lp-profile-subtitle">
            Semiconductors · Learning platforms · Life optimization
          </div>
        </div>
      </div>
      <div className="lp-hero-media">
        <ImageSlider />
        <div className="lp-contact-card">
          <div>
            <div className="lp-contact-label">Email</div>
            <a href={`mailto:${CONTACT.email}`} className="lp-contact-email">
              {CONTACT.email}
            </a>
          </div>
          <div className="lp-contact-links">
            {CONTACT.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="lp-contact-link">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
