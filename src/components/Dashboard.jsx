import { FARMER, WEATHER } from "../data";

function WeatherBar({ data }) {
  const maxRain = Math.max(...data.map((d) => d.rain));
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 72 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            title={`${d.rain}mm · ${d.temp}°C`}
            style={{
              width: "100%",
              background: d.rain > 35 ? "#0284c7" : d.rain > 18 ? "#38bdf8" : "#bae6fd",
              height: `${Math.max(4, (d.rain / maxRain) * 52)}px`,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.6s ease",
              cursor: "default",
            }}
          />
          <div style={{ fontSize: 9, color: "#94a3b8" }}>{d.day}</div>
        </div>
      ))}
    </div>
  );
}

const STATS = [
  { label: "Total Land", value: FARMER.land, sub: "Own + Sharecrop", icon: "🗺️", color: "#0284c7" },
  { label: "Active Season", value: "Rabi 2025", sub: "4 crops registered", icon: "🌾", color: "#16a34a" },
  { label: "Subsidy Balance", value: FARMER.subsidyBalance, sub: "Fertilizer & seed", icon: "💰", color: "#9333ea" },
  { label: "Insurance", value: "Active", sub: "Crop + Health", icon: "🛡️", color: "#ea580c" },
];

const QUICK_ACTIONS = [
  { label: "Apply for seasonal crop loan", color: "#0284c7" },
  { label: "Claim natural disaster relief", color: "#dc2626" },
  { label: "Register a new crop", color: "#16a34a" },
  { label: "Check live market prices", color: "#9333ea" },
  { label: "Book machinery (tractor hire)", color: "#ea580c" },
];

export default function Dashboard() {
  const heavyRainDay = WEATHER.find((d) => d.rain > 35);

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 12, marginBottom: 16 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Weather */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, fontWeight: 600 }}>
            🌧 7-Day Rainfall Forecast (mm)
          </div>
          <WeatherBar data={WEATHER} />
          {heavyRainDay && (
            <div style={{
              marginTop: 12, fontSize: 11, color: "#fcd34d",
              background: "rgba(251,191,36,0.08)", borderRadius: 6,
              padding: "6px 10px", border: "1px solid rgba(251,191,36,0.2)",
            }}>
              ⚠ Heavy rain expected {heavyRainDay.day} ({heavyRainDay.rain}mm) — delay irrigation & secure nursery beds
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, fontWeight: 600 }}>⚡ Quick Actions</div>
          {QUICK_ACTIONS.map((a, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "9px 12px",
              marginBottom: 8, fontSize: 13, cursor: "pointer", display: "flex",
              alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.06)",
              transition: "background 0.2s",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              {a.label}
              <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 11 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
