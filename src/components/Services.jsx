import { SERVICES } from "../data";

export default function Services() {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        All services are accessible through your Farmers Card — no middlemen, no cash handling.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
        {SERVICES.map((s, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "22px 16px", textAlign: "center",
              cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.bn}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.4 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
