import { useState } from "react";
import { CROPS } from "../data";

const STATUS_STYLE = {
  healthy: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#6ee7b7", label: "✓ Healthy" },
  alert:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  color: "#fca5a5", label: "⚠ Alert"   },
  warning: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fcd34d", label: "! Warning"  },
};

export default function Crops() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Registered Crops — Season 2025</div>
          <div style={{ fontSize: 12, color: "#6ee7b7", cursor: "pointer", padding: "4px 10px",
            background: "rgba(16,185,129,0.1)", borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)" }}>
            + Register New
          </div>
        </div>

        {/* Rows */}
        {CROPS.map((c, i) => {
          const st = STATUS_STYLE[c.status] || STATUS_STYLE.healthy;
          const isOpen = expanded === i;

          return (
            <div
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                borderBottom: i < CROPS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Summary row */}
              <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {c.name} <span style={{ opacity: 0.45, fontSize: 13, fontWeight: 400 }}>{c.bn}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {c.upazila} · {c.season} · {c.land}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    display: "inline-block", borderRadius: 20, padding: "3px 10px",
                    fontSize: 11, fontWeight: 600,
                    background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                  }}>{st.label}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{c.yieldEst} q/ha est.</div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{
                  padding: "0 18px 16px",
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                }}>
                  {[
                    ["Fertilizer", c.fertilizer],
                    ["Irrigation", c.irrigation],
                    ["Pest Risk", c.pestRisk],
                    ["Insurance", c.insurance],
                    ["Loan", c.loan],
                    ["Market Price", c.marketPrice],
                  ].map(([k, v], j) => (
                    <div key={j} style={{
                      background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "8px 10px",
                      fontSize: 12,
                    }}>
                      <div style={{ color: "#64748b", marginBottom: 2 }}>{k}</div>
                      <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "#475569", marginTop: 10, textAlign: "center" }}>
        Tap a row to expand crop details · Data synced from BARI &amp; DAE field records
      </div>
    </div>
  );
}
