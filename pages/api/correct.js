export default async function handler(req, res) {
  const { text, language } = req.body;
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
          - Ignore punctuation (commas, dots, question marks, exclamation marks).
          - Focus only on grammar, spelling, word order, verb tense, and logical correctness.
          - Always correct the ENTIRE sentence, not just part of it.
          - The output must be a FULLY CORRECT version of the sentence that a native speaker could say naturally.
          - Do NOT provide explanations. Return ONLY the corrected sentence.`,
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
