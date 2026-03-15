import { useState } from "react";
import { SERVICES } from "../data";

const BN = { fontFamily: "'Noto Serif Bengali', 'Hind Siliguri', serif" };
const UI = { fontFamily: "'Hind Siliguri', 'Noto Serif Bengali', sans-serif" };

export default function Services() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>

      {/* Header banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,78,59,0.5), rgba(15,25,40,0.6))",
        border: "1px solid rgba(16,185,129,0.18)",
        borderRadius: 14, padding: "14px 18px", marginBottom: 18,
      }}>
        <div style={{ ...BN, fontSize: 17, fontWeight: 700, color: "#6ee7b7", marginBottom: 4 }}>
          কৃষক কার্ডের মাধ্যমে প্রাপ্ত সেবাসমূহ
        </div>
        <div style={{ ...UI, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
          কৃষক কার্ডের মাধ্যমে সকল সরকারি ও আর্থিক সেবা পান — DAE ধারণাপত্র থেকে মূল্যায়ন করা হয়েছে।
          কোনো দালাল নয় · কোনো নগদ লেনদেন নয় · সরাসরি কৃষকের কাছে সুবিধা।
        </div>
      </div>

      {/* Service grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {SERVICES.map((s, i) => {
          const isOpen = active === i;
          return (
            <div
              key={i}
              onClick={() => setActive(isOpen ? null : i)}
              style={{
                background: isOpen ? s.accent : "rgba(255,255,255,0.03)",
                border: `1px solid ${isOpen ? s.color + "55" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14, padding: "16px 18px",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: isOpen ? `0 6px 24px ${s.color}22` : "none",
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = s.color + "44"; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: s.accent, border: `1px solid ${s.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ ...BN, fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 12, color: "#475569",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                }}>▼</div>
              </div>

              {/* Description */}
              <div style={{ ...UI, fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>
                {s.descBn}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ marginTop: 12, animation: "fadeUp 0.2s ease" }}>
                  <div style={{
                    ...UI, fontSize: 11, color: "#64748b", lineHeight: 1.6, marginBottom: 10,
                    paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    {s.descEn}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.details.map((d, di) => (
                      <span key={di} style={{
                        ...UI, fontSize: 11, fontWeight: 600,
                        background: s.accent, border: `1px solid ${s.color}44`,
                        color: s.color, borderRadius: 20, padding: "2px 10px",
                      }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <button style={{
                    marginTop: 12, width: "100%", padding: "8px",
                    background: s.accent, border: `1px solid ${s.color}55`,
                    borderRadius: 8, color: s.color, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", ...UI,
                  }}>
                    আবেদন করুন / Apply →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div style={{
        marginTop: 16, padding: "12px 16px",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, ...UI, fontSize: 11, color: "#475569", lineHeight: 1.7,
      }}>
        📋 <strong style={{ color: "#64748b" }}>সূত্র:</strong> তথ্য-প্রযুক্তি নির্ভর সরকারি কৃষি সেবায় অগ্রাধিকারভিত্তিক কৌশল হিসেবে
        কৃষক কার্ড তৈরী, বিতরণ ও সেবা প্রদান বিষয়ক পাইলট প্রকল্প — কৃষি সম্প্রসারণ অধিদপ্তর (DAE)।
        সেবার তালিকা PDF ধারণাপত্রের ৩–৪ পৃষ্ঠা থেকে সংকলিত।
      </div>
    </div>
  );
}
