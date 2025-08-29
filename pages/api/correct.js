export default async function handler(req, res) {
  const { text } = req.body;

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
            content:
              "You are a grammar and spelling corrector. Ignore punctuation (commas, dots, question marks, exclamation marks). Focus only on grammar, spelling, and word order. Return only the corrected text, concise, no explanations.",
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
