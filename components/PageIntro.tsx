import type { ReactNode } from "react";
import ProfileSignature from "./ProfileSignature";
import profileStyles from "./ProfileSignature.module.css";
import styles from "./PageIntro.module.css";

export default function PageIntro({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <header className={`${profileStyles.header} ${styles.intro} ${className}`}>
    <div>{children}</div>
    <ProfileSignature />
  </header>;
}
