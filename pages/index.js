import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { Volume2, Check, Square, Mic } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

export default function Home() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  let recognition;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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

      const corrected = await correctText(transcript);
      getAIResponse(transcript, corrected);
    };

    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognition && recognition.stop();
    setListening(false);
  };

  const correctText = async (text) => {
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return data.corrected || text;
    } catch (err) {
      console.error("Correction failed:", err);
      return text;
    }
  };

  const getAIResponse = async (original, corrected) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original, corrected }),
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
      };
    }

    if (
      parsed.corrections.trim().toLowerCase() === original.trim().toLowerCase() ||
      parsed.explanation?.toLowerCase().includes("is correct")
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          explanation: "",
          corrections: "",
          alternative: parsed.alternative || "",
          correct: true,
        },
      ]);
      return;
    }

    if (
      parsed.explanation?.includes("can be expressed more naturally") &&
      !parsed.corrections
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          explanation: "",
          corrections: "",
          alternative: parsed.alternative || "",
          correct: true,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        ...parsed,
        mistakes: parsed.mistakes || [],
        correct: false,
      },
    ]);

    if (parsed.explanation) {
      speak(parsed.explanation);
    }
  };

  const speak = (msg) => {
    if (!msg) return;

    const textWithPauses = msg.replace(/\.\s+/g, ".\n\n");
    const synth = window.speechSynthesis;
    synth.cancel(); // important pentru performanță
    const utter = new SpeechSynthesisUtterance(textWithPauses);

    utter.lang = "en-US";
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
    .sort((a, b) => b.length - a.length) // expresiile mai lungi primele
    .forEach(mistake => {
      if (!mistake) return;
      const escaped = mistake.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      highlighted = highlighted.replace(
        regex,
        match => `<span style="text-decoration: line-through; color: red;">${match}</span>`
      );
    });

  // îl returnăm ca React element, nu ca HTML brut
  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
};


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fix<span className="caveat" style={{ color:"#fc0" }}>My</span>Language!</h1>

      <motion.button
        onClick={listening ? stopListening : startListening}
        className={styles.talkButton}
        disabled={speaking}
        animate={
          speaking
            ? { scale: [1, 1.05, 1], opacity: [1, 0.7, 1] }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 1, repeat: speaking ? Infinity : 0 }}
      >
        {speaking ? (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Mic size={22} /> Talking...
          </span>
        ) : listening ? (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Square size={22} style={{ fill: "red" }} /> Stop
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Mic size={22} /> Talk
          </span>
        )}
      </motion.button>

      <div className={styles.chatBox}>
        {messages.map((m, i) => (
          <Message
            key={i}
            m={m}
            i={i}
            nextMessage={messages[i + 1]}
            speak={speak}
            highlightMistakes={highlightMistakes}
            speaking={speaking}
          />
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

/* 🧊 Componentă înghețată: NU se recalculează la fiecare update */
const Message = React.memo(function Message({ m, i, nextMessage, speak, highlightMistakes, speaking }) {
  return (
    <div className={styles.messageBlock}>
      {m.role === "user" && m.type === "original" && (
        <div className={styles.userText}>
          <span>
            <b>You:</b> {highlightMistakes(m.text, nextMessage?.mistakes)}
          </span>

          {nextMessage?.role === "ai" && nextMessage?.correct && (
            <motion.span
              initial={{ scale: 0.3 }}
              animate={{ scale: [0.3, 1.2, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Check size={24} strokeWidth={3} color="limegreen" />
            </motion.span>
          )}
        </div>
      )}

      {m.role === "ai" && (
        <div className={styles.aiBubble}>
          {m.explanation && !m.correct && (
            <div className={styles.aiText}>
              {m.explanation.split(". ").map((line, idx) => (
                <div key={idx} style={{ marginBottom: "6px" }}>
                  {line.trim().endsWith(".") ? line.trim() : line.trim() + "."}
                </div>
              ))}
            </div>
          )}

          {m.corrections && !m.correct && (
            <div className={styles.optionBlock}>
              <button
                className={styles.optionBtn}
                onClick={() => speak(m.corrections)}
              >
                <Volume2 size={16} style={{ marginRight: "5px" }} /> Corrections
              </button>
              <p className={styles.subText}>{m.corrections}</p>
            </div>
          )}

{m.alternative &&
 m.alternative.trim() !== m.corrections?.trim() &&
 m.alternative.trim().toLowerCase() !== nextMessage?.original?.trim().toLowerCase() && (
  <div className={styles.optionBlock}>
    <button
      className={styles.optionBtn}
      onClick={() => speak(m.alternative)}
      disabled={speaking}
    >
      <Volume2 size={16} style={{ marginRight: "5px" }} /> Natural alternative
    </button>
    <p className={styles.subText}>{m.alternative}</p>
  </div>
)}


        </div>
      )}
    </div>
  );
});
