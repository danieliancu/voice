import "@/styles/globals.css";
import { Caveat } from "next/font/google";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/AuthContext";
import { SoundProvider } from "@/lib/SoundContext"; 
import { LanguageProvider } from "@/lib/LanguageContext";
import { ChatProvider } from "@/lib/ChatContext";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SoundProvider>
        <LanguageProvider>
          <ChatProvider>
            <Navbar />
            <Component {...pageProps} />
          </ChatProvider>
        </LanguageProvider>
      </SoundProvider>
    </AuthProvider>
  );
}
