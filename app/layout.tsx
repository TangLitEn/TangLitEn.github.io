import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import SWRegister from "./sw-register";

export const metadata = {
  title: "Lit En — Personal Site",
  description: "Problem solving, learning systems, and life optimization.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png"
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
