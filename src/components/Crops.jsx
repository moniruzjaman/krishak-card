import { useState } from "react";
import { CROPS } from "../data";
import { Modal } from "./ui";

const STATUS_STYLE = {
  healthy: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#6ee7b7", label: "✓ সুস্থ" },
  alert:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  color: "#fca5a5", label: "⚠ সতর্কতা"   },
  warning: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fcd34d", label: "! সতর্ক"  },
};

export default function Crops() {
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
          <div style={{ fontSize: 14, fontWeight: 700 }}>নিবন্ধিত ফসল — মৌসুম ২০২৫</div>
          <div style={{ fontSize: 12, color: "#6ee7b7", cursor: "pointer", padding: "4px 10px",
            background: "rgba(16,185,129,0.1)", borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)" }}
            onClick={() => setModalOpen(true)}>
            + নতুন নিবন্ধন
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
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{c.yieldEst} কুইন্টাল/হেক্টর প্রাক্কলন</div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{
                  padding: "0 18px 16px",
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                }}>
                  {[
                    ["সার", c.fertilizer],
                    ["সেচ", c.irrigation],
                    ["কীট আক্রমণ", c.pestRisk],
                    ["বীমা", c.insurance],
                    ["ঋণ", c.loan],
                    ["বাজার মূল্য", c.marketPrice],
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
        একটি সারি ট্যাপ করে ফসলের বিস্তারিত তথ্য দেখুন · ডেটা BARI ও DAE মাঠ থেকে সিঙ্ক করা হয়েছে
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="নতুন ফসল নিবন্ধন">
        <p style={{ marginBottom: "12px" }}>আপনার জমিতে চাষ করা নতুন ফসল নিবন্ধন করতে নিচের তথ্য প্রদান করুন:</p>
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          <li style={{ marginBottom: "8px" }}>ফসলের নাম ও জাত</li>
          <li style={{ marginBottom: "8px" }}>আবাদের তারিখ</li>
          <li style={{ marginBottom: "8px" }}>জমির পরিমাণ</li>
          <li style={{ marginBottom: "8px" }}>প্রত্যাশিত ফলন</li>
          <li style={{ marginBottom: "8px" }}>সেচ ও সারের তথ্য</li>
        </ul>
        <p style={{ marginTop: "12px", color: "#94a3b8" }}>উপজেলা কৃষি অফিসে যোগাযোগ করে আবেদন করুন।</p>
      </Modal>
    </div>
  );
}
