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

// Homepage headings per language
const homeTexts = {
  en: {
    title: "Fix Language. Learn the Smart Way.",
    subtitle:
      "Fixbly doesn’t just correct your English — it teaches you how to improve. Get instant feedback on grammar, vocabulary, pronunciation and sentence structure, all while chatting naturally with your AI tutor.",
  },
  fr: {
    title: "Corrigez votre langue. Apprenez de manière intelligente.",
    subtitle:
      "Bonjour ! Je suis votre assistant de correction en anglais. Appuyez sur Parler ou Écrire ci‑dessous et je vous aiderai à corriger vos phrases.",
  },
  de: {
    title: "Assistent für Englischkorrektur",
    subtitle:
      "Hallo! Ich bin Ihr Assistent zur Korrektur von Englisch. Tippen Sie unten auf Sprechen oder Schreiben und ich helfe Ihnen, Ihre Sätze zu korrigieren.",
  },
  ro: {
    title: "Asistentul tău pentru corectarea englezei",
    subtitle:
      "Salut! Sunt asistentul tău pentru corectarea englezei. Apasă pe Vorbește sau Scrie mai jos și te voi ajuta să‑ți corectezi propozițiile.",
  },
};

// Overrides for new marketing headline/subheadline per language
const homeOverrides = {
  en: {
    title: "Fix Language. Learn the Smart Way.",
    subtitle:
      "Fixbly doesn’t just correct your English — it teaches you how to improve. Get instant feedback on grammar, vocabulary, pronunciation and sentence structure, all while chatting naturally with your AI tutor.",
  },
  fr: {
    title: "Corrigez votre langue. Apprenez de manière intelligente.",
    subtitle:
      "Fixbly ne se contente pas de corriger votre français — il vous apprend à vous améliorer. Obtenez un retour instantané sur la grammaire, le vocabulaire, la prononciation et la structure des phrases, tout en discutant naturellement avec votre tuteur IA.",
  },
  de: {
    title: "Sprache verbessern. Intelligent lernen.",
    subtitle:
      "Fixbly korrigiert nicht nur Ihr Deutsch — es zeigt Ihnen, wie Sie sich verbessern. Erhalten Sie sofortiges Feedback zu Grammatik, Wortschatz, Aussprache und Satzbau – während Sie natürlich mit Ihrem KI‑Tutor chatten.",
  },
  ro: {
    title: "Corectează limba. Învață inteligent.",
    subtitle:
      "Fixbly nu doar îți corectează româna — te învață cum să te îmbunătățești. Primești feedback instant pentru gramatică, vocabular, pronunție și structura propoziției, în timp ce discuți natural cu tutorul tău AI.",
  },
};

// Landing/marketing copy per language
const landingTexts = {
  en: {
    headTitle: "Practice, get instant corrections, and learn faster",
    headDescription:
      "Practice speaking and writing, receive instant corrections, and learn natural alternatives. Voice and text modes, multi-language support, and clear explanations to improve faster.",
    ogTitle: "Practice, get instant corrections, and learn faster",
    ogDescription:
      "Speak or write and get instant corrections with clear explanations. Learn faster with voice and text modes.",
    valueSectionTitle: "What you can do",
    cards: [
      { title: "Speak naturally", text: "Practice real conversations and get instant corrections you can act on." },
      { title: "Write clearly", text: "Improve your writing with grammar, style, and tone suggestions." },
      { title: "Instant feedback", text: "See mistakes highlighted and learn natural alternatives right away." },
      { title: "Focused & private", text: "Your practice space with no distractions. You choose when to save." },
    ],
    howTitle: "How it works",
    steps: [
      { title: "Talk or Write", text: "Use voice or text to send your sentence or question." },
      { title: "Get corrections", text: "We highlight mistakes and provide a more natural alternative." },
      { title: "Learn by doing", text: "Listen, repeat, and iterate quickly to internalize the right patterns." },
    ],
    whyTitle: "Why you’ll improve faster",
    features: [
      "Real-time grammar and style suggestions",
      "Clear explanations and natural alternatives",
      "Voice practice with instant playback",
      "Friendly UI designed for focus",
      "Works great on mobile and desktop",
    ],
    languagesTitle: "Languages",
  },
  fr: {
    headTitle: "Pratiquez, corrigez instantanément et progressez plus vite",
    headDescription:
      "Pratiquez l’oral et l’écrit, recevez des corrections instantanées et des alternatives naturelles. Voix et texte, multilingue, explications claires pour progresser plus vite.",
    ogTitle: "Pratiquez, corrigez instantanément et progressez plus vite",
    ogDescription:
      "Parlez ou écrivez et obtenez des corrections immédiates avec des explications claires.",
    valueSectionTitle: "Ce que vous pouvez faire",
    cards: [
      { title: "Parlez naturellement", text: "Pratiquez de vraies conversations et obtenez des corrections immédiates et actionnables." },
      { title: "Écrivez clairement", text: "Améliorez votre écriture avec des suggestions de grammaire, de style et de ton." },
      { title: "Retour instantané", text: "Voyez les erreurs mises en évidence et apprenez des alternatives naturelles." },
      { title: "Focalisé et privé", text: "Votre espace d’entraînement sans distractions. Vous choisissez quand enregistrer." },
    ],
    howTitle: "Comment ça marche",
    steps: [
      { title: "Parler ou Écrire", text: "Utilisez la voix ou le texte pour envoyer votre phrase ou question." },
      { title: "Recevez des corrections", text: "Nous mettons en évidence les erreurs et proposons une alternative plus naturelle." },
      { title: "Apprendre en faisant", text: "Écoutez, répétez et itérez pour intégrer rapidement les bons réflexes." },
    ],
    whyTitle: "Pourquoi vous progressez plus vite",
    features: [
      "Suggestions de grammaire et de style en temps réel",
      "Explications claires et alternatives naturelles",
      "Pratique orale avec lecture instantanée",
      "Interface épurée conçue pour la concentration",
      "Excellent sur mobile et ordinateur",
    ],
    languagesTitle: "Langues",
  },
  de: {
    headTitle: "Üben, sofort korrigieren, schneller lernen",
    headDescription:
      "Üben Sie Sprechen und Schreiben, erhalten Sie sofortige Korrekturen und natürliche Alternativen. Stimme und Text, mehrsprachig und klare Erklärungen für schnelleres Lernen.",
    ogTitle: "Üben, sofort korrigieren, schneller lernen",
    ogDescription:
      "Sprechen oder schreiben Sie und erhalten Sie sofortige Korrekturen mit klaren Erklärungen.",
    valueSectionTitle: "Was Sie tun können",
    cards: [
      { title: "Natürlich sprechen", text: "Üben Sie echte Gespräche und erhalten Sie sofort umsetzbare Korrekturen." },
      { title: "Klar schreiben", text: "Verbessern Sie Ihr Schreiben mit Vorschlägen zu Grammatik, Stil und Ton." },
      { title: "Sofortiges Feedback", text: "Fehler werden hervorgehoben und natürliche Alternativen sofort gezeigt." },
      { title: "Fokussiert & privat", text: "Ihr Übungsraum ohne Ablenkungen. Sie entscheiden, wann Sie speichern." },
    ],
    howTitle: "So funktioniert’s",
    steps: [
      { title: "Sprechen oder Schreiben", text: "Nutzen Sie Stimme oder Text, um Ihren Satz oder Ihre Frage zu senden." },
      { title: "Korrekturen erhalten", text: "Wir markieren Fehler und schlagen natürlichere Alternativen vor." },
      { title: "Lernen durch Tun", text: "Hören, wiederholen und schnell iterieren, um Muster zu verinnerlichen." },
    ],
    whyTitle: "Warum Sie schneller lernen",
    features: [
      "Grammatik- und Stilvorschläge in Echtzeit",
      "Klare Erklärungen und natürliche Alternativen",
      "Sprechpraxis mit sofortiger Wiedergabe",
      "Auf Fokus ausgelegte, übersichtliche Oberfläche",
      "Funktioniert auf Handy und Desktop großartig",
    ],
    languagesTitle: "Sprachen",
  },
  ro: {
    headTitle: "Exersează, primește corecturi instant și învață mai repede",
    headDescription:
      "Exersează vorbirea și scrierea, primește corecturi instant și alternative naturale. Moduri voce și text, suport multilingv și explicații clare pentru progres rapid.",
    ogTitle: "Exersează, primește corecturi instant și învață mai repede",
    ogDescription:
      "Vorbește sau scrie și primești corecturi imediate, cu explicații clare.",
    valueSectionTitle: "Ce poți face aici",
    cards: [
      { title: "Vorbește natural", text: "Exersează conversații reale și primește corecturi instant ușor de aplicat." },
      { title: "Scrie clar", text: "Îmbunătățește-ți scrisul cu sugestii de gramatică, stil și ton." },
      { title: "Feedback instant", text: "Vezi greșelile evidențiate și învață imediat alternative naturale." },
      { title: "Focus și confidențialitate", text: "Spațiu de exersare fără distrageri. Tu alegi când salvezi." },
    ],
    howTitle: "Cum funcționează",
    steps: [
      { title: "Vorbește sau Scrie", text: "Folosește vocea sau textul pentru a trimite propoziția sau întrebarea." },
      { title: "Primești corecturi", text: "Evidențiem greșelile și oferim o variantă mai naturală." },
      { title: "Învățare prin practică", text: "Ascultă, repetă și iterează rapid ca să fixezi tiparele corecte." },
    ],
    whyTitle: "De ce progresezi mai repede",
    features: [
      "Sugestii de gramatică și stil în timp real",
      "Explicații clare și alternative naturale",
      "Exersare pe voce cu redare instant",
      "Interfață prietenoasă, gândită pentru focus",
      "Merge excelent pe mobil și desktop",
    ],
    languagesTitle: "Limbi",
  },
};

// Header/Navbar texts per language
const headerTexts = {
  en: {
    menu: { features: "Features", pricing: "Pricing", support: "Support" },
    features: { how: "How it works", examples: "Examples", blog: "Blog / Resources" },
    support: { faq: "FAQ", contact: "Contact", referral: "Referral Program", account: "My Account" },
    aria: { selectLanguage: "Select language", toggleSound: "Toggle sound", toggleMenu: "Toggle menu" },
  },
  fr: {
    menu: { features: "Fonctionnalités", pricing: "Tarifs", support: "Support" },
    features: { how: "Comment ça marche", examples: "Exemples", blog: "Blog / Ressources" },
    support: { faq: "FAQ", contact: "Contact", referral: "Programme de parrainage", account: "Mon compte" },
    aria: { selectLanguage: "Choisir la langue", toggleSound: "Activer/désactiver le son", toggleMenu: "Ouvrir/fermer le menu" },
  },
  de: {
    menu: { features: "Funktionen", pricing: "Preise", support: "Support" },
    features: { how: "So funktioniert’s", examples: "Beispiele", blog: "Blog / Ressourcen" },
    support: { faq: "FAQ", contact: "Kontakt", referral: "Empfehlungsprogramm", account: "Mein Konto" },
    aria: { selectLanguage: "Sprache wählen", toggleSound: "Ton umschalten", toggleMenu: "Menü umschalten" },
  },
  ro: {
    menu: { features: "Funcționalități", pricing: "Prețuri", support: "Suport" },
    features: { how: "Cum funcționează", examples: "Exemple", blog: "Blog / Resurse" },
    support: { faq: "Întrebări frecvente", contact: "Contact", referral: "Program de recomandări", account: "Contul meu" },
    aria: { selectLanguage: "Alege limba", toggleSound: "Sunet on/off", toggleMenu: "Deschide/închide meniul" },
  },
};

// Footer texts per language
const footerTexts = {
  en: {
    solutionsTitle: "Solutions",
    solutions: ["Speaking Practice", "Writing Practice", "Grammar Correction", "AI Tutor", "Progress Tracking"],
    supportTitle: "Support",
    support: ["Submit ticket", "Documentation", "Guides", "FAQ", "Contact us"],
    companyTitle: "Company",
    company: ["About", "Blog", "Jobs", "Press", "Referral Program"],
    legalTitle: "Legal",
    legal: ["Terms of service", "Privacy policy", "License", "Cookies", "Security"],
    newsletterTitle: "Subscribe to our newsletter",
    newsletterDesc: "The latest news, articles, and resources, sent to your inbox weekly.",
    newsletterPlaceholder: "Enter your email",
    newsletterCTA: "Subscribe",
    bottom: "© 2024 Fixbly. All rights reserved.",
  },
  fr: {
    solutionsTitle: "Solutions",
    solutions: ["Pratique orale", "Pratique écrite", "Correction grammaticale", "Tuteur IA", "Suivi des progrès"],
    supportTitle: "Support",
    support: ["Ouvrir un ticket", "Documentation", "Guides", "FAQ", "Nous contacter"],
    companyTitle: "Entreprise",
    company: ["À propos", "Blog", "Emplois", "Presse", "Programme de parrainage"],
    legalTitle: "Légal",
    legal: ["Conditions d’utilisation", "Politique de confidentialité", "Licence", "Cookies", "Sécurité"],
    newsletterTitle: "Abonnez‑vous à notre newsletter",
    newsletterDesc: "Les dernières nouvelles et ressources, envoyées chaque semaine dans votre boîte mail.",
    newsletterPlaceholder: "Entrez votre e‑mail",
    newsletterCTA: "S’abonner",
    bottom: "© 2024 Fixbly. Tous droits réservés.",
  },
  de: {
    solutionsTitle: "Lösungen",
    solutions: ["Sprechtraining", "Schreibtraining", "Grammatik-Korrektur", "KI‑Tutor", "Fortschrittsverfolgung"],
    supportTitle: "Support",
    support: ["Ticket erstellen", "Dokumentation", "Leitfäden", "FAQ", "Kontakt"],
    companyTitle: "Unternehmen",
    company: ["Über uns", "Blog", "Jobs", "Presse", "Empfehlungsprogramm"],
    legalTitle: "Rechtliches",
    legal: ["Nutzungsbedingungen", "Datenschutz", "Lizenz", "Cookies", "Sicherheit"],
    newsletterTitle: "Newsletter abonnieren",
    newsletterDesc: "Neuigkeiten und Ressourcen – wöchentlich per E‑Mail.",
    newsletterPlaceholder: "E‑Mail eingeben",
    newsletterCTA: "Abonnieren",
    bottom: "© 2024 Fixbly. Alle Rechte vorbehalten.",
  },
  ro: {
    solutionsTitle: "Soluții",
    solutions: ["Exersare vorbire", "Exersare scriere", "Corectare gramatică", "Tutor IA", "Urmărire progres"],
    supportTitle: "Suport",
    support: ["Trimite tichet", "Documentație", "Ghiduri", "FAQ", "Contactează‑ne"],
    companyTitle: "Companie",
    company: ["Despre", "Blog", "Cariere", "Presă", "Program de recomandări"],
    legalTitle: "Legal",
    legal: ["Termeni și condiții", "Politică de confidențialitate", "Licență", "Cookie‑uri", "Securitate"],
    newsletterTitle: "Abonează‑te la newsletter",
    newsletterDesc: "Noutăți și resurse, trimise săptămânal pe e‑mail.",
    newsletterPlaceholder: "Introdu emailul",
    newsletterCTA: "Abonare",
    bottom: "© 2024 Fixbly. Toate drepturile rezervate.",
  },
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
        home: { ...(homeTexts[language] || homeTexts.en), ...(homeOverrides[language] || homeOverrides.en) },
        landing: landingTexts[language] || landingTexts.en,
        header: headerTexts[language] || headerTexts.en,
        footer: footerTexts[language] || footerTexts.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
