import { LEDGER_EVENTS, PILOT_SITES } from "../data";

const TYPE_COLORS = {
  subsidy:   "#16a34a",
  iot:       "#0891b2",
  loan:      "#0284c7",
  insurance: "#dc2626",
  market:    "#9333ea",
  crop:      "#ea580c",
};

const NETWORK_INFO = [
  { label: "Platform", value: "Hyperledger Fabric" },
  { label: "Consensus", value: "PBFT" },
  { label: "Throughput", value: "~600 TPS" },
  { label: "Latency", value: "~500ms avg" },
  { label: "Storage", value: "Hybrid (on/off-chain)" },
  { label: "Status", value: "● Live", isLive: true },
];

export default function BlockchainLedger() {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      {/* Network info panel */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: 18, marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
          🔗 Bangladesh Agricultural Blockchain Network
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {NETWORK_INFO.map((n, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{n.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: n.isLive ? "#6ee7b7" : "white", marginTop: 2 }}>
                {n.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger events */}
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
        Recent On-Chain Transactions (Immutable)
      </div>
      {LEDGER_EVENTS.map((e, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 9,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
            background: e.status === "confirmed" ? TYPE_COLORS[e.type] || "#10b981" : "#f59e0b",
            animation: e.status === "pending" ? "pulse 1.5s infinite" : "none",
            boxShadow: e.status === "confirmed" ? `0 0 8px ${TYPE_COLORS[e.type] || "#10b981"}60` : "none",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{e.event}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 3 }}>
              txHash: {e.hash}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{e.time}</div>
            <div style={{
              fontSize: 10, marginTop: 3, fontWeight: 700,
              color: e.status === "confirmed" ? "#6ee7b7" : "#fcd34d",
            }}>{e.status.toUpperCase()}</div>
          </div>
        </div>
      ))}

      {/* Pilot sites */}
      <div style={{ fontSize: 13, color: "#94a3b8", margin: "18px 0 10px", fontWeight: 600 }}>
        📍 Pilot Upazila Coverage (8 Divisions)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {PILOT_SITES.map((s, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: "10px 12px", fontSize: 12,
          }}>
            <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{s.upazila}, {s.district}</div>
            <div style={{ color: "#64748b" }}>{s.division} Division</div>
            <div style={{ color: "#6ee7b7", marginTop: 4 }}>{s.crop}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#475569", marginTop: 14, textAlign: "center" }}>
        All records are cryptographically signed and tamper-proof · Identity managed via Self-Sovereign Identity (SSI) + XACML
      </div>
    </div>
  );
}
