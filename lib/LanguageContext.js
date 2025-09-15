import { createContext, useContext, useState, useEffect } from "react";

// Mapping pentru coduri recunoscute de SpeechRecognition & SpeechSynthesis
const langVoices = {
  en: "en-US", // English
  fr: "fr-FR", // French
  de: "de-DE", // German
  ro: "ro-RO", // Romanian
};

const langNames = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ro: "Română",
};

// Intro messages per language
const introMessages = {
  en: "Hello! I’m your English correction assistant. Just tap the Talk or Write button below and I’ll help you correct your sentences.",
  fr: "Bonjour ! Je suis votre assistant de correction en français. Appuyez sur le bouton Parler ou Écrire ci-dessous et je vous aiderai à corriger vos phrases.",
  de: "Hallo! Ich bin Ihr deutscher Korrekturassistent. Tippen Sie unten auf Sprechen oder Schreiben und ich helfe Ihnen, Ihre Sätze zu korrigieren.",
  ro: "Salut! Sunt asistentul tău de corectare în limba română. Apasă butonul Vorbește sau Scrie de mai jos și te voi ajuta să îți corectezi propozițiile."
};

// Button labels per language
const buttonLabels = {
  en: { 
    talk: "Talk", 
    stop: "Stop", 
    write: "Write", 
    learn: "Learn", 
    placeholder: "Type a message...",
    corrections: "Corrections",
    alternative: "Natural alternative"
  },
  fr: { 
    talk: "Parler", 
    stop: "Arrêter", 
    write: "Écrire", 
    learn: "Apprendre", 
    placeholder: "Écrivez un message...",
    corrections: "Corrections",
    alternative: "Alternative naturelle"
  },
  de: { 
    talk: "Sprechen", 
    stop: "Stopp", 
    write: "Schreiben", 
    learn: "Lernen", 
    placeholder: "Nachricht eingeben...",
    corrections: "Korrekturen",
    alternative: "Natürlichere Alternative"
  },
  ro: { 
    talk: "Vorbește", 
    stop: "Oprește", 
    write: "Scrie", 
    learn: "Învață", 
    placeholder: "Scrie un mesaj...",
    corrections: "Corecturi",
    alternative: "Variantă naturală"
  }
};


// ✅ Lista de limbi (ca să nu mai fie hardcode în Navbar)
export const availableLanguages = Object.keys(langNames).map((code) => ({
  code,
  label: langNames[code],
}));

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en"); // default English

  // 🔹 restorează limba din localStorage
  useEffect(() => {
    const saved = localStorage.getItem("appLanguage");
    if (saved && langVoices[saved]) {
      setLanguage(saved);
    }
  }, []);

  // 🔹 salvează limba în localStorage când se schimbă
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        voiceCode: langVoices[language] || "en-US", // 👈 pentru STT și TTS
        languageName: langNames[language] || "English", // 👈 pentru UI & mesaje
        introMessage: introMessages[language] || introMessages.en,
        labels: buttonLabels[language] || buttonLabels.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
