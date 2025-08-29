import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { Volume2 } from "lucide-react"; // 🔊 icon

export default function Home() {
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  let recognition;

  // Scroll automat la ultima bulă
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start STT
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;

      // Save original
      const originalMessage = {
        role: "user",
        type: "original",
        text: transcript,
      };
      setMessages((prev) => [...prev, originalMessage]);

      // Correct text
      const corrected = await correctText(transcript);

      // Send original + corrected to AI
      getAIResponse(transcript, corrected);
    };

    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognition && recognition.stop();
    setListening(false);
  };

  // Correction API call
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

  // Main chat call
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
        explanation: data.reply,
        corrections: "",
        alternative: "",
      };
    }

    // Vorbește explicația
    if (parsed.explanation) {
      speak(parsed.explanation);
    }

    setMessages((prev) => [...prev, { role: "ai", ...parsed }]);
  };

  // TTS (ignoram complet semnele de punctuație)
  const speak = (msg) => {
    const cleanMsg = msg.replace(/[.,!?;]/g, ""); // elimină punctuația
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(cleanMsg);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    synth.speak(utter);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>FixMeEnglish</h1>
      <button
        onClick={listening ? stopListening : startListening}
        className={styles.talkButton}
      >
        {listening ? "Stop" : "Talk"}
      </button>

      <div className={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} className={styles.messageBlock}>
            {/* Original user message */}
            {m.role === "user" && m.type === "original" && (
              <p className={styles.userText}>
                <b>You:</b> {m.text}
              </p>
            )}

            {/* AI response */}
            {m.role === "ai" && (
              <div className={styles.aiBubble}>
                <p className={styles.aiText}>
                  <b>AI:</b> {m.explanation}
                </p>

                {m.corrections && (
                  <div className={styles.optionBlock}>
                    <button
                      className={styles.optionBtn}
                      onClick={() => speak(m.corrections)}
                    >
                      <span className={styles.icon}>🔊</span> Corrections
                    </button>
                    <p className={styles.subText}>{m.corrections}</p>
                  </div>
                )}

                {m.alternative && (
                  <div className={styles.optionBlock}>
                    <button
                      className={styles.optionBtn}
                      onClick={() => speak(m.alternative)}
                    >
                      <span className={styles.icon}>🔊</span> Natural alternative
                    </button>
                    <p className={styles.subText}>{m.alternative}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
