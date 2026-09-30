import Image from "next/image";
import styles from "./ProfileSignature.module.css";

const flags = [
  { code: "my", label: "Malaysia — Malaysian" },
  { code: "sg", label: "Singapore — Permanent resident" },
];

export default function ProfileSignature() {
  return (
    <figure className={styles.signature}>
      <Image className={styles.avatar} src="/avatar.png" alt="Lit En" width={104} height={104} priority />
      <div className={styles.flags}>
        {flags.map((flag) => (
          <Image key={flag.code} src={`/flags/${flag.code}.svg`} alt={flag.label} title={flag.label} width={32} height={22} />
        ))}
      </div>
      <figcaption className={styles.motto}>
        <span lang="zh-Hans">永远在学习</span>
        <span className={styles.translation}>Always learning.</span>
      </figcaption>
    </figure>
  );
}
