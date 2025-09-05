import "@/styles/globals.css";
import { Caveat } from 'next/font/google';
import Navbar from "@/components/Navbar"; // importăm componenta nouă

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
