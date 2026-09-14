import FlagCollection from "./honours/FlagCollection";
import Image from "next/image";
import type { Badge } from "../lib/badges";

export function Medal({ badge }: { badge: Badge }) {
  return <Image className={`medal-image ${badge.status === "wip" ? "medal-wip" : ""}`} src={badge.image} alt="" width={96} height={112} />;
}

export default function BadgeCollection({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return <section id="honours" className="honours" aria-label="Honours flags">
    <FlagCollection badges={badges} />
  </section>;
}
