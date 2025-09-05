import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { Volume2, Check, Square, Mic, Pen, Send } from "lucide-react"; // ➕ Pen și Send
import { motion } from "framer-motion";
import React from "react";

export default function Home() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [writeMode, setWriteMode] = useState(false); // ➕ nou state
  const [inputText, setInputText] = useState(""); // ➕ text scris
  const [messages, setMessages] = useState([
    {
      role: "ai",
      explanation: "",
      corrections: "",
      alternative: "",
      mistakes: [],
      correct: false,
      intro: true,
      text: "Hello! I’m your English correction assistant. Just tap the Talk or Write button below and I’ll help you correct your sentences."
    }
  ]);

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

  const speak = (msg) => {
    if (!msg) return;
    const textWithPauses = msg.replace(/\.\s+/g, ".\n\n");
    const synth = window.speechSynthesis;
    synth.cancel();
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
    const corrected = await correctText(messageToSend);
    await getAIResponse(messageToSend, corrected);
  };


  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "40px" }}>
          {/* Buton TALK */}
          <motion.button
            onClick={listening ? stopListening : startListening}
            className={styles.talkButton}
            disabled={speaking || writeMode} // dezactivat dacă e în Write
          >
            {listening ? (
              <span className={styles.containerBtn}><Square size={18} style={{ fill: "red" }} /> Stop</span>
            ) : (
              <span className={styles.containerBtn}><Mic size={18} /> Talk</span>
            )}
          </motion.button>

          {/* Buton WRITE */}
          <button
            onClick={() => setWriteMode((prev) => !prev)}
            className={styles.talkButton}
            style={{
              background: writeMode ? "#f59e0b" : "linear-gradient(90deg,#06b6d4,#3b82f6)"
            }}
          >
            <span className={styles.containerBtn}>
              <Pen size={18} /> Write {writeMode ? "On" : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Chat messages */}
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

      {/* INPUT WhatsApp-like */}
      {writeMode && (
        <div className={styles.inputBar}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className={styles.textInput}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            name="no-autofill"   // 👈 nume non-standard
            autoComplete="new-password" // 👈 hack des folosit
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
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
              <Check size={24} strokeWidth={3} color="limegreen" />
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
                      className={styles.optionBtn}
                      onClick={() => speak(m.corrections)}
                    >
                      <Volume2
                        size={16}
                        style={{ marginRight: "5px" }}
                      />{" "}
                      Corrections
                    </button>
                    <p className={styles.subText}>{m.corrections}</p>
                  </div>
                )}

              {m.alternative &&
                !isSimilar(m.alternative, m.corrections) && (
                  <div className={styles.optionBlock}>
                    <button
                      className={styles.optionBtn}
                      onClick={() => speak(m.alternative)}
                      disabled={speaking}
                    >
                      <Volume2
                        size={16}
                        style={{ marginRight: "5px" }}
                      />{" "}
                      Natural alternative
                    </button>
                    <p className={styles.subText}>{m.alternative}</p>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

