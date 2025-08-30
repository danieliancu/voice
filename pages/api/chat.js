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
            content: `
You are an English grammar correction assistant.

Rules for evaluation:
- Ignore punctuation completely.
- Accept contractions (I'm, don't, won't, etc.) as correct English.
- Focus ONLY on grammar, spelling, and word order errors.
- Politeness, formality, or style (like adding "please") are NOT errors.
- "corrections" must always be the FULLY CORRECT version of the original grammar (never add words like "please").
- "alternative" must always provide a more natural, polite, or clearer phrasing (here you can add "please" or rephrase for tone).
- Always return a list of wrong words/phrases from the original sentence as "mistakes".
- If the sentence is grammatically correct, do NOT mention clarity, politeness, or formality.
  In this case:
    • "explanation" = "" (empty string)
    • "corrections" = original sentence
    • "mistakes" = []
    • "alternative" = still provided

Return STRICT JSON only:

{
  "explanation": "short explanation of errors, or empty if none",
  "corrections": "fully corrected grammar version (or original if no errors)",
  "alternative": "natural / polite / clear version",
  "mistakes": ["list", "of", "exact wrong words or short phrases, as they appear in the original sentence. Never return a single common word like 'to' or 'is' unless the whole phrase is wrong."]
}
          `
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
