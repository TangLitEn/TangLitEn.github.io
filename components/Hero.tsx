"use client";

import Image from "next/image";
import ImageSlider from "./ImageSlider";
import { CONTACT } from "../data/contact";
import { ORGANISATION_CHIPS } from "../data/organisations";

export default function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-copy">
        <div className="lp-profile">
          <div className="lp-profile-avatar-wrap">
            <Image
              src="/avatar.png"
              alt="Avatar"
              width={190}
              height={190}
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
          <div className="lp-org-chip-row" aria-label="Current organizations">
            {ORGANISATION_CHIPS.map((org) => (
              <a
                key={org.name}
                href={org.href}
                target="_blank"
                rel="noreferrer noopener"
                className="lp-slider-btn lp-org-chip"
              >
                <span className="lp-org-chip-logo-wrap" aria-hidden="true">
                  <Image
                    src={org.logo}
                    alt={`${org.name} logo`}
                    width={14}
                    height={14}
                    className="lp-org-chip-logo"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </span>
                <span>{org.name}</span>
              </a>
            ))}
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
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="lp-contact-link"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
