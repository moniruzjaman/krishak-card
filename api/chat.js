/**
 * Vercel Serverless Function — Secure Claude API Proxy
 *
 * POST /api/chat
 * Body: { messages: [...], system?: string }
 */

export default async function handler(req, res) {
  // CORS — tighten origin in production if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Use VITE_OPENAI_API_KEY from environment or process.env directly
  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const openAiMessages = [];
  if (system) {
    openAiMessages.push({ role: "system", content: system });
  }
  openAiMessages.push(...messages);

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // fast + affordable 
        temperature: 0.7,
        messages: openAiMessages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json();
      return res.status(upstream.status).json({ error: err.error?.message || "Upstream API error" });
    }

    const data = await upstream.json();
    const text = data.choices[0]?.message?.content || "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("OpenAI proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
