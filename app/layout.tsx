import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Container from "../components/Container";

export const metadata = {
  title: "Lit En — Personal Site",
  description: "Problem solving, learning systems, and life optimization."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <Container>{children}</Container>
        <Footer />
      </body>
    </html>
  );
}
