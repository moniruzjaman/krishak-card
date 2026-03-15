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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server." });
  }

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fast + affordable for advisory queries
        max_tokens: 1024,
        system: system || "",
        messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json();
      return res.status(upstream.status).json({ error: err.error?.message || "Upstream API error" });
    }

    const data = await upstream.json();
    const text = data.content?.map((b) => (b.type === "text" ? b.text : "")).join("") || "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("Claude proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
