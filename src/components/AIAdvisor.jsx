import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "../hooks/useChat";
import { SUGGESTED_QUESTIONS } from "../data";

export default function AIAdvisor() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]); // [{role, text}]
  const { ask, loading, error } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function handleAsk() {
    const q = query.trim();
    if (!q || loading) return;
    setQuery("");
    setHistory((h) => [...h, { role: "user", text: q }]);
    const response = await ask(q);
    if (response) {
      setHistory((h) => [...h, { role: "assistant", text: response }]);
    } else if (error) {
      setHistory((h) => [...h, { role: "error", text: error }]);
    }
  }

  return (
    <div style={{ animation: "fadeUp 0.3s ease", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header card */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: 14, padding: 18,
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 30 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Agricultural Advisor</div>
            <div style={{ fontSize: 12, color: "#6ee7b7", marginTop: 2 }}>
              Powered by Claude (Anthropic) · কৃষি পরামর্শদাতা
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10, lineHeight: 1.5 }}>
          Ask about crop diseases, fertilizer doses, IPM, government schemes, market timing, and weather-based management.
          Responses follow DAE Bangladesh guidelines.
        </div>
      </div>

      {/* Suggested questions */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuery(q)}
            style={{
              background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
              color: "#6ee7b7", borderRadius: 20, padding: "5px 12px",
              cursor: "pointer", fontSize: 11, transition: "background 0.2s",
            }}
          >{q}</button>
        ))}
      </div>

      {/* Chat history */}
      {history.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12,
          maxHeight: 420, overflowY: "auto",
        }}>
          {history.map((msg, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: 10, alignItems: "flex-start",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "#065f46" : msg.role === "error" ? "#7f1d1d" : "#1e1b4b",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>
                {msg.role === "user" ? "👨‍🌾" : msg.role === "error" ? "⚠" : "🤖"}
              </div>
              <div style={{
                background: msg.role === "user"
                  ? "rgba(6,78,59,0.4)"
                  : msg.role === "error"
                  ? "rgba(127,29,29,0.3)"
                  : "rgba(30,27,75,0.4)",
                border: `1px solid ${msg.role === "user" ? "rgba(16,185,129,0.2)" : msg.role === "error" ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.2)"}`,
                borderRadius: 12, padding: "10px 14px",
                maxWidth: "78%", fontSize: 13, lineHeight: 1.6, color: "#e2e8f0",
              }}>
                {msg.role === "assistant" ? (
                  <div className="md-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px",
                background: "rgba(30,27,75,0.4)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12 }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
                    animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "36px 20px", color: "#475569" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌾</div>
          <div style={{ fontSize: 13 }}>Ask any farming question to get AI-powered advice</div>
          <div style={{ fontSize: 11, marginTop: 6 }}>Tap a suggestion above or type below</div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
          placeholder="Ask about your crops, pests, subsidies… (English or বাংলা)"
          disabled={loading}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)", color: "white",
            borderRadius: 12, padding: "12px 16px", fontSize: 13,
            outline: "none", fontFamily: "inherit",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          style={{
            background: "#16a34a", border: "none", color: "white",
            borderRadius: 12, padding: "12px 20px", cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16, transition: "background 0.2s",
            opacity: loading || !query.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "⏳" : "➤"}
        </button>
      </div>

      <div style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>
        AI advice is for guidance only · Always verify with your local Sub-Assistant Agriculture Officer (SAAO)
      </div>
    </div>
  );
}
