import type { Metadata } from "next";
import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import SWRegister from "./sw-register";
import { getSearchIndex } from "../lib/posts";

const ICON_VERSION = "20260211-v4";
export const metadata: Metadata = {
  metadataBase: new URL("https://tangliten.github.io"),
  title: { default: "Lit En — A personal notebook", template: "%s — Lit En" },
  description: "Learning notes, research, engineering projects, and life checkpoints. A personal notebook by Lit En.",
  openGraph: { title: "Lit En — A personal notebook", description: "Learning, building, figuring things out. Notes on engineering, learning systems, and life.", type: "website", locale: "en_SG", siteName: "Lit En", images: [{ url: "https://tangliten.github.io/og.png", width: 1731, height: 909, alt: "Lit En — Learning, building, figuring things out." }] },
  twitter: { card: "summary_large_image", images: ["https://tangliten.github.io/og.png"] },
  manifest: `/manifest.json?v=${ICON_VERSION}`,
  icons: { icon: `/icon.png?v=${ICON_VERSION}`, shortcut: `/icon.png?v=${ICON_VERSION}`, apple: `/apple-icon.png?v=${ICON_VERSION}` }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><NavBar entries={getSearchIndex()} /><Container>{children}</Container><Footer /><SWRegister /></body></html>;
}
