import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import stylesPremium from "../styles/Premium.module.css";
import { Volume2, Check, Square, Mic, Pen, Send, BookOpen, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useSound } from "../lib/SoundContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useChat } from "@/lib/ChatContext";
import React from "react";
import PremiumModal from "@/components/PremiumModal";

export default function Home() {
  const [showPremium, setShowPremium] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [writeMode, setWriteMode] = useState(false); // ➕ nou state
  const [inputText, setInputText] = useState(""); // ➕ text scris
  const { language, voiceCode, introMessage, labels, home } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      explanation: "",
      corrections: "",
      alternative: "",
      mistakes: [],
      correct: false,
      intro: true,
      text: introMessage, // 👈 vine direct din context
    }
  ]);

  const [copied, setCopied] = useState(null); // ➕ stare pentru copiere

// pentru copy în clipboard
const handleCopy = (text, key) => {
  navigator.clipboard.writeText(text);
  setCopied(key); // salvăm un ID unic, nu textul
  setTimeout(() => setCopied(null), 2000);
};

  const chatEndRef = useRef(null);

  let recognition;


  useEffect(() => {
    setMessages([
      {
        role: "ai",
        explanation: "",
        corrections: "",
        alternative: "",
        mistakes: [],
        correct: false,
        intro: true,
        text: introMessage, // 👈 direct din context
      }
    ]);
  }, [language, introMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist conversation across client-side route changes only
  const { messages: savedMessages, setMessages: setSavedMessages } = useChat();

  // Restore saved conversation on mount (if any)
  useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Save latest conversation on unmount
  const latestMessagesRef = useRef(messages);
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    return () => {
      setSavedMessages(latestMessagesRef.current || []);
    };
  }, []);

  const startListening = () => {
    if (showWelcome) setShowWelcome(false);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = voiceCode;
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;

      const originalMessage = {
        role: "user",
        type: "original",
        text: transcript,
      };
      setMessages((prev) => [...prev, originalMessage]);

      recognition.stop();
      setListening(false);

      const corrected = await correctText(transcript, "voice");
      getAIResponse(transcript, corrected, "voice");
    };

    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognition && recognition.stop();
    setListening(false);
  };

  const correctText = async (text, mode = "text") => {
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, mode }), // 👈 trimitem limba + modul (voice/text)
      });
      const data = await res.json();
      return data.corrected || text;
    } catch (err) {
      console.error("Correction failed:", err);
      return text;
    }
  };

  const getAIResponse = async (original, corrected, mode = "text") => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original, corrected, language, mode }), // 👈 trimitem limba + modul
    });
    const data = await res.json();

    let parsed;
    try {
      parsed = JSON.parse(data.reply);
    } catch (e) {
      parsed = {
        explanation: "",
        corrections: "",
        alternative: "",
        mistakes: [],
      };
    }

    // ✅ cazul în care propoziția e corectă → marchează mesajul user ca "correct"
    if (
      parsed.explanation === "" &&
      parsed.mistakes?.length === 0 &&
      parsed.corrections.trim().toLowerCase() === original.trim().toLowerCase()
    ) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          correct: true
        };
        return updated;
      });
      return;
    }

    // cazul clasic → afișăm corecturile/explicațiile
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        ...parsed,
        correct: false,
        original, // ➕ ca să ai referință pentru comparație
      },
    ]);

    if (parsed.explanation) {
      speak(parsed.explanation);
    }
  };

  const { soundOn } = useSound();

  const speak = (msg) => {
    if (!msg || !soundOn) {
      window.speechSynthesis.cancel(); // 👈 dacă e off, taie doar vocea
      return;
    }

    const textWithPauses = msg.replace(/\.\s+/g, ".\n\n");
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(textWithPauses);

    utter.lang = voiceCode;
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => {
      setSpeaking(true);
      setListening(false);
    };

    utter.onend = () => {
      setSpeaking(false);
    };

    synth.speak(utter);
  };

  const highlightMistakes = (text, mistakes) => {
    if (!mistakes || mistakes.length === 0) return text;

    let highlighted = text;
    mistakes
      .sort((a, b) => b.length - a.length)
      .forEach((mistake) => {
        if (!mistake) return;
        const escaped = mistake.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "gi");
        highlighted = highlighted.replace(
          regex,
          (match) =>
            `<span style="text-decoration: line-through; color: red;">${match}</span>`
        );
      });

    return highlighted; // string HTML
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageToSend = inputText; // păstrăm textul curent
    setInputText(""); // 🔹 golește imediat inputul (UI se șterge)

    const originalMessage = {
      role: "user",
      type: "original",
      text: messageToSend,
    };
    setMessages((prev) => [...prev, originalMessage]);

    // trimitem în fundal la corectare și AI
    const corrected = await correctText(messageToSend, "text");
    await getAIResponse(messageToSend, corrected, "text");
  };

  // Show headings only initially; hide after first interaction or any non-intro message
  const hasRealMessage = messages.some((m) => !m.intro);
  useEffect(() => {
    if (showWelcome && hasRealMessage) setShowWelcome(false);
  }, [hasRealMessage, showWelcome]);

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        {showWelcome && !hasRealMessage && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h1 className={stylesPremium.title}>{home?.title}</h1>
            <h2 style={{ fontWeight:"100", padding:"0 20px" }} className={stylesPremium.subtitle}>{home?.subtitle}</h2>
          </div>
        )}
        <div className={ styles.containerBtn }>
          {/* Buton TALK */}
          <motion.button
            onClick={listening ? stopListening : startListening}
            className={styles.talkButton}
            disabled={speaking || writeMode} // dezactivat dacă e în Write
            style={{ background: listening ? "rgb(245, 158, 11)" : "" }}
          >
            {listening ? (
              <span className={styles.containerBtn}>
                <Square size={18} style={{ fill: "red" }} /> {labels.stop}
              </span>
            ) : (
              <span className={styles.containerBtn}>
                <Mic size={18} /> {labels.talk}
              </span>
            )}
          </motion.button>

          {/* Buton WRITE */}
          <button
            onClick={() => {
              setWriteMode((prev) => {
                const next = !prev;
                if (next && showWelcome) setShowWelcome(false);
                return next;
              });
            }}
            className={styles.talkButton}
            style={{ background: writeMode ? "#f59e0b" : "linear-gradient(90deg,#06b6d4,#3b82f6)" }}
          >
            <span className={styles.containerBtn}>
              <Pen size={18} /> {labels.write}
            </span>
          </button>

          {/* Buton LEARN */}
          <button
            onClick={() => {
              if (showWelcome) setShowWelcome(false);
              setShowPremium(true);
            }}
            className={styles.talkButton}
          >
            <span className={styles.containerBtn}>
              <BookOpen size={18} /> {labels.learn}
            </span>
          </button>

          {/* Modal Premium */}
          <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
        </div>
      </div>

      {/* Chat messages */}
      <div
        className={styles.chatBox}
        style={{
  marginBottom: writeMode && window.innerWidth < 1000 ? "60px" : "0"
}}
      >
        {messages.map((m, i) => (
          <Message
            key={i}
            m={m}
            i={i}
            nextMessage={messages[i + 1]}
            speak={speak}
            highlightMistakes={highlightMistakes}
            speaking={speaking}
            labels={labels}
            handleCopy={handleCopy}
            copied={copied}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT WhatsApp-like */}
      {writeMode && (
        <div className={styles.inputBar}>
          {/* 👇 câmp dummy care „mănâncă” autocomplete-ul */}
          <input
            type="text"
            style={{ display: "none" }}
            autoComplete="username"
          />

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={labels.placeholder}
            className={styles.textInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            autoComplete="new-password" // 👈 hack sigur
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="fake-field"
            id="fake-field"
            style={{
              resize: "none",
              overflow: "hidden",
            }}
          />

          <button onClick={handleSend} className={styles.sendBtn}>
            <Send size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

const Message = React.memo(function Message({
  m,
  i,
  nextMessage,
  speak,
  highlightMistakes,
  speaking,
  labels, // 👈 primim labels direct ca prop
  handleCopy, // 👈 primit din Home
  copied      // 👈 primit din Home
}) {
  // Funcție de normalizare
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

  // Verifică dacă două propoziții sunt aproape identice
  const isSimilar = (a, b) => {
    if (!a || !b) return false;
    const normA = normalize(a);
    const normB = normalize(b);
    if (normA === normB) return true;

    // Dacă diferă doar printr-un cuvânt "filler"
    const fillers = ["please", "well", "actually", "just"];
    const wordsA = normA.split(" ");
    const wordsB = normB.split(" ");

    if (Math.abs(wordsA.length - wordsB.length) <= 1) {
      return fillers.some(
        (f) =>
          normA === normB + " " + f ||
          normB === normA + " " + f
      );
    }
    return false;
  };

  return (
    <div className={styles.messageBlock}>
      {m.role === "user" && m.type === "original" && (
        <div
          className={`${styles.userText} ${m.correct ? styles.correct : ""}`}
        >
          <span>
            <b>You:</b>{" "}
            {m.correct ? (
              m.text
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMistakes(m.text, nextMessage?.mistakes),
                }}
              />
            )}
          </span>

          {m.correct && (
            <motion.span
              initial={{ scale: 0.3 }}
              animate={{ scale: [0.3, 1.2, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Check size={20} strokeWidth={3} color="green" />
            </motion.span>
          )}
        </div>
      )}

      {m.role === "ai" && (
        <div className={styles.aiBubble}>
          {m.intro ? (
            <div className={styles.aiText}>{m.text}</div>
          ) : (
            <>
              {m.explanation && (
                <div className={styles.aiText}>
                  {m.explanation.split(". ").map((line, idx) => (
                    <div key={idx} style={{ marginBottom: "6px" }}>
                      {line.trim().endsWith(".")
                        ? line.trim()
                        : line.trim() + "."}
                    </div>
                  ))}
                </div>
              )}

              {m.corrections &&
                m.corrections.trim().toLowerCase() !==
                  m.original?.trim().toLowerCase() && (
                  <div className={styles.optionBlock}>
                    <button
                      className={`${styles.optionBtn} ${styles.blueBtn}`}
                      onClick={() => speak(m.corrections)}
                    >
                      <Volume2 size={16} style={{ marginRight: "5px" }} />{" "}
                      {labels.corrections}
                      <Copy
                        size={14}
                        style={{ marginLeft: "auto", cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevenim trigger pe speak
                          handleCopy(m.corrections, `${i}-corrections`);
                        }}
                      />
                    </button>
                    <p className={styles.subText}>
                      {m.corrections}
                      {copied === `${i}-corrections` && (
                        <span className={styles.copied}> Copied!</span>
                      )}
                    </p>
                  </div>
                )}

              {m.alternative && !isSimilar(m.alternative, m.corrections) && (
                <div className={styles.optionBlock}>
                  <button
                    className={`${styles.optionBtn} ${styles.blueBtn}`}
                    onClick={() => speak(m.alternative)}
                    disabled={speaking}
                  >
                    <Volume2 size={16} style={{ marginRight: "5px" }} />{" "}
                    {labels.alternative}
                    <Copy
                      size={14}
                      style={{ marginLeft: "auto", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(m.alternative, `${i}-alternative`);
                      }}
                    />
                  </button>
                  <p className={styles.subText}>
                    {m.alternative}
                    {copied === `${i}-alternative` && (
                      <span className={styles.copied}> Copied!</span>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});
