export default async function handler(req, res) {
  const { original, corrected, language, mode } = req.body;

    // default la engleză dacă nu vine nimic
  const targetLang = language || "en";

const langMessages = {
  en: {
    name: "English",
    warning: "Your sentence is not in English. Please write in English to get corrections."
  },
  fr: {
    name: "French",
    warning: "Votre phrase n’est pas en français. Veuillez écrire en français pour obtenir des corrections."
  },
  de: {
    name: "German",
    warning: "Ihr Satz ist nicht auf Deutsch. Bitte schreiben Sie auf Deutsch, um Korrekturen zu erhalten."
  },
  ro: {
    name: "Romanian",
    warning: "Propoziția ta nu este în română. Te rog să scrii în română pentru a primi corecturi."
  }
};

  const langConfig = langMessages[targetLang] || langMessages["en"];

  // 🔹 Funcție pentru normalizare: ignorăm punctuația și majusculele
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:]/g, "") // scoatem punctuația
      .replace(/\s+/g, " ")     // spații multiple → unul singur
      .trim();

  try {
    // dacă originalul și corectatul sunt identice după normalizare → e corect
    if (normalize(original) === normalize(corrected)) {
      return res.status(200).json({
        reply: JSON.stringify({
          explanation: "",
          corrections: original.trim(),
          alternative: original.trim(), // putem da o variantă identică
          mistakes: [],
        }),
      });
    }

    // altfel mergem pe OpenAI pentru evaluare detaliată
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
You are a grammar correction assistant for ${langConfig.name}.

If the input is NOT written in ${langConfig.name}, do NOT translate it.  
Instead, return this JSON immediately:  
{
  "explanation": "${langConfig.warning}",
  "corrections": "",
  "alternative": "",
  "mistakes": []
}


Rules for evaluation (when input IS in ${langConfig.name}):
- You will ALWAYS treat the input as an isolated, independent sentence. 
- Do NOT connect it to any previous input.
- Ignore punctuation completely. Never mention punctuation in the explanation or corrections.
- Provide "corrections" and "alternative" always in ${langConfig.name}.
- Ignore capitalization. Do not treat lowercase/uppercase differences as errors (e.g., sentence starting with lowercase is acceptable).
- Accept both single-word and two-word variants as correct if both are common in - Provide "corrections" and "alternative" always in ${langConfig.name}. (e.g., "Goodnight" and "Good night").
- Accept common variations with apostrophes, hyphens, or shortened forms (e.g., "rock’n’roll" and "rock and roll", "e-mail" and "email"). Do not treat these as mistakes.
- Accept both American and British spelling variations as correct (e.g., "color/colour", "organize/organise").
- Accept plural variations and regional alternatives as correct (e.g., "cactuses/cacti", "indexes/indices", "math/math(s)").
- Accept abbreviations and acronyms in any common form (e.g., "USA/U.S.A.", "OK/O.K.").
- Accept contractions (I'm, don't, won't, etc.) as correct - Provide "corrections" and "alternative" always in ${langConfig.name}.
- Focus ONLY on grammar, spelling, and word order errors.
- Politeness, formality, or style (like adding "please") are NOT errors.
- "corrections" must always be the FULLY CORRECT version of the original grammar (never add words like "please").
- "alternative" must always provide a more natural, polite, or clearer phrasing (here you can add "please" or rephrase for tone).
- Always return a list of wrong words/phrases from the original sentence as "mistakes".
- If the sentence is grammatically correct, do NOT mention clarity, politeness, formality, punctuation, capitalization, or word splitting.
  In this case:
    • "explanation" = "" (empty string)
    • "corrections" = original sentence
    • "mistakes" = []
     • "alternative" = still provided

${mode === "voice" ? `
Additional constraints for VOICE MODE:
- Never add or change punctuation in "corrections"; preserve punctuation exactly as in the original (even if missing or incorrect).
- Do not mention punctuation anywhere. Do not list punctuation as mistakes.
- If the only differences are punctuation or capitalization, treat the sentence as correct and return empty "explanation".
` : ``}

Return STRICT JSON only:

{
  "explanation": "short explanation of errors, or empty if none",
  "corrections": "fully corrected grammar version (or original if no errors)",
  "alternative": "natural / polite / clear version",
  "mistakes": ["list", "of", "exact wrong words or short phrases"]
}
            `,
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
