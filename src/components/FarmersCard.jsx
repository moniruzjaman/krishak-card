import { FARMER } from "../data";

export default function FarmersCard({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, backdropFilter: "blur(10px)",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "92%", animation: "popIn 0.3s ease" }}>
        {/* Card body */}
        <div style={{
          background: "linear-gradient(140deg, #064e3b 0%, #065f46 50%, #047857 100%)",
          borderRadius: 22, padding: "28px 30px", color: "white", position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          {/* Decorative glows */}
          <div style={{ position: "absolute", top: -70, right: -70, width: 200, height: 200, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 160, height: 160, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />

          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.6, marginBottom: 5, fontFamily: "monospace" }}>
                GOVERNMENT OF BANGLADESH · DAE
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0.5 }}>কৃষক কার্ড</div>
              <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 3 }}>FARMERS CARD</div>
            </div>
            {/* EMV chip */}
            <div style={{
              width: 48, height: 38,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
              borderRadius: 7, boxShadow: "0 4px 14px rgba(251,191,36,0.45)",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 6,
            }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 2 }} />
              ))}
            </div>
          </div>

          {/* Farmer info */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 22 }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, border: "2px solid rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}>👨‍🌾</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{FARMER.name}</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{FARMER.district} · {FARMER.division}</div>
              <div style={{ fontSize: 11, opacity: 0.45, fontFamily: "monospace", marginTop: 3 }}>NID: {FARMER.nid}</div>
            </div>
          </div>

          {/* Card number */}
          <div style={{ fontFamily: "monospace", fontSize: 20, letterSpacing: 4, marginBottom: 20, opacity: 0.9 }}>
            {FARMER.cardNo}
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 9, opacity: 0.45, marginBottom: 3 }}>VALID THRU</div>
              <div style={{ fontSize: 14, fontFamily: "monospace" }}>12/28</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, opacity: 0.45, marginBottom: 3 }}>CATEGORY</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{FARMER.category}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, opacity: 0.45, marginBottom: 3 }}>LAND (DEC)</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{FARMER.land}</div>
            </div>
          </div>

          {/* Footer stripe */}
          <div style={{
            marginTop: 20, paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace" }}>{FARMER.gps}</div>
            <div style={{
              background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.5)",
              borderRadius: 20, padding: "3px 12px", fontSize: 10, color: "#6ee7b7", fontWeight: 700,
            }}>✓ VERIFIED</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 14, width: "100%", background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
            borderRadius: 12, padding: "11px", cursor: "pointer", fontSize: 13,
            backdropFilter: "blur(6px)", transition: "background 0.2s",
          }}
        >
          Close (tap outside or press Esc)
        </button>
      </div>
    </div>
  );
}
