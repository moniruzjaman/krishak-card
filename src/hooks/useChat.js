import { useState } from "react";
import { AI_SYSTEM_PROMPT } from "../data";

/**
 * useChat — thin wrapper around /api/chat (Vercel serverless proxy).
 * Falls back to direct Anthropic call in local dev if VITE_ANTHROPIC_API_KEY is set.
 */
export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function ask(userMessage) {
    setLoading(true);
    setError(null);

    // In local dev you can set VITE_ANTHROPIC_API_KEY in .env.local for direct calls.
    // In production (Vercel) we always go through /api/chat so the key stays server-side.
    const isDirect = import.meta.env.VITE_ANTHROPIC_API_KEY && import.meta.env.DEV;

    try {
      let text = "";

      if (isDirect) {
        // ── Local dev direct call ─────────────────────────────────────────────
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: AI_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userMessage }],
          }),
        });
        const data = await res.json();
        text = data.content?.map((b) => (b.type === "text" ? b.text : "")).join("") || "";
      } else {
        // ── Production — go through /api/chat proxy ───────────────────────────
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: AI_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userMessage }],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "API error");
        text = data.text;
      }

      setLoading(false);
      return text;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }

  return { ask, loading, error };
}
