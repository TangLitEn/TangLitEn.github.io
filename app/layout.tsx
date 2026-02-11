import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import SWRegister from "./sw-register";

const ICON_VERSION = "20260211-v4";

export const metadata = {
  title: "Lit En — Personal Site",
  description: "Problem solving, learning systems, and life optimization.",
  manifest: `/manifest.json?v=${ICON_VERSION}`,
  icons: {
    icon: `/icon.png?v=${ICON_VERSION}`,
    shortcut: `/icon.png?v=${ICON_VERSION}`,
    apple: `/apple-icon.png?v=${ICON_VERSION}`
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div aria-hidden style={{ height: 76 }} />
        <Container>{children}</Container>
        <Footer />
        <SWRegister />
      </body>
    </html>
  );
}
