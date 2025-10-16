export default async function handler(req, res) {
  const { text, language, mode } = req.body;
  const targetLang = language || "en";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a strict grammar and logic corrector for ${targetLang.toUpperCase()} sentences.
          - Focus only on grammar, spelling, word order, verb tense, and logical correctness.
          - Always correct the ENTIRE sentence, not just part of it.
          - Do NOT provide explanations. Return ONLY the corrected sentence.
          ${mode === "voice" ? `
          - VOICE MODE: Do NOT add or change punctuation or capitalization. Preserve punctuation exactly as in the input (including if there is none). If the input has no punctuation, return the corrected text without punctuation as well.
          ` : `
          - Ignore punctuation when judging correctness, but you may keep or lightly adjust punctuation if needed.
          `}`,
          },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    const corrected = data?.choices?.[0]?.message?.content?.trim() || text;

    res.status(200).json({ corrected });
  } catch (err) {
    console.error("Correction error:", err);
    res.status(500).json({ corrected: text });
  }
}
