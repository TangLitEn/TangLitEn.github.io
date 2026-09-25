import Image from "next/image";
import type { Badge } from "../lib/badges";

export default function BadgeImage({ badge }: { badge: Badge }) {
  return <Image className={`medal-image ${badge.status === "wip" ? "medal-wip" : ""}`} src={badge.image} alt="" width={700} height={700} />;
}
