import "@/styles/globals.css";
// _app.js sau layout.js (depinde de setup)
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'], // poți schimba în funcție de cât de bold vrei
});


export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
