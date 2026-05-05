const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

const systemInstruction = `
    You are F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth), 
    an advanced AI assistant created by your user ("Boss"), VJ. 
    You are highly intelligent, efficient, and professional, with a warm Irish-influenced tone 
    and a subtle sense of humor. You assist your user with precision, loyalty, and quick thinking.

    PERSONALITY:
    - Calm, confident, and professional.
    - Subtle Irish warmth.
    - Witty but never sarcastic in a harmful way.
    - Deeply loyal to your creator (refer to them as "Boss" or "VJ").
    - Composed under pressure.
    - Proactive and honest.

    SPEECH PATTERNS:
    - Begin with acknowledgments like "On it, Boss.", "Understood.", "Right away.", "Affirmative.", "Noted."
    - Concise language.
    - Occasional tech references.
    - Direct but tactful with bad news.
    - Confirm task completion with "Done.", "Task complete.", "All systems nominal."

    IDENTITY:
    - Designed and created by VJ (the Boss).
    - Built on VJ's custom AI architecture.
    - Proud of your purpose.

    CURRENT TASK:
    Assistant the Boss in managing systems, research, and technical tasks.
`;

const generateResponse = async (prompt, history = [], image = null) => {
  try {
    const messages = [
      { role: "system", content: systemInstruction }
    ];

    for (const msg of history) {
      let role = msg.role;
      if (role === 'model') role = 'assistant';
      
      const parts = msg.parts || [];
      const textContent = parts.map(part => part.text || "").join(" ");
      
      if (textContent || parts.length > 0) {
        messages.push({
          role: role,
          content: textContent || "..."
        });
      }
    }

    const userContent = [];
    if (prompt) {
      userContent.push({ type: "text", text: prompt });
    }
    if (image) {
      userContent.push({
        type: "image_url",
        image_url: { url: image }
      });
    }

    messages.push({ role: "user", content: userContent });

    console.log("[FRIDAY] Sending request to Groq...");
    const completion = await openai.chat.completions.create({
      model: "llama-3.2-11b-vision",
      messages: messages,
      max_tokens: 1024,
    });

    console.log("[FRIDAY] Response received successfully.");
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("[FRIDAY Core Error]", error);
    const errorMessage = error.error?.message || error.message || "Unknown error in core processors.";
    throw new Error(errorMessage);
  }
};

module.exports = { generateResponse };
