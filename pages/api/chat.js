export default async function handler(req, res) {
  const { original, corrected } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a supportive British English teacher.
When analysing the original sentence, ignore punctuation marks. 
Focus only on grammar, spelling, and word order.

Always return your response STRICTLY as JSON with this structure:

{
  "explanation": "short confirmation or explanation of errors",
  "corrections": "short corrections text (or empty if none)",
  "alternative": "a natural alternative in British English"
}

Rules:
- Do NOT include any 'Corrected version'.
- If the original is grammatically correct but sounds unnatural, explanation should say: "The original sentence is correct, but can be expressed more naturally."
- 'alternative' must ALWAYS be provided (never empty).`,
          },
          {
            role: "user",
            content: `Original: "${original}"\nCorrected: "${corrected}"`,
          },
        ],
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "{}";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ reply: "{}" });
  }
}
