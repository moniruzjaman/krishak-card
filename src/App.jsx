import { useState, useEffect } from "react";
import { FARMER } from "./data";
import FarmersCard from "./components/FarmersCard";
import Dashboard from "./components/Dashboard";
import Services from "./components/Services";
import Crops from "./components/Crops";
import BlockchainLedger from "./components/BlockchainLedger";
import AIAdvisor from "./components/AIAdvisor";

const TABS = [
  { id: "dashboard",  label: "Dashboard",  icon: "🏠" },
  { id: "services",   label: "Services",   icon: "⚡" },
  { id: "crops",      label: "My Crops",   icon: "🌾" },
  { id: "blockchain", label: "Ledger",     icon: "🔗" },
  { id: "advisor",    label: "AI Advisor", icon: "🤖" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setShowCard(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "Georgia, 'Noto Serif Bengali', serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        body { background: #0f172a; }
        @keyframes popIn  { from { transform: scale(0.88) translateY(18px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(14px); opacity: 0; }            to { transform: translateY(0);    opacity: 1; } }
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input::placeholder { color: #475569; }
        .md-content p  { margin: 0 0 8px; }
        .md-content ul { padding-left: 18px; margin: 0 0 8px; }
        .md-content li { margin-bottom: 3px; }
        .md-content strong { color: #a7f3d0; }
        .md-content code { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
      `}</style>

      {showCard && <FarmersCard onClose={() => setShowCard(false)} />}

      <header style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #0f4c38 100%)",
        borderBottom: "1px solid rgba(16,185,129,0.18)",
        padding: "14px 20px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.55, marginBottom: 3 }}>
              GOVERNMENT OF BANGLADESH · DEPT. OF AGRICULTURAL EXTENSION
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              কৃষক কার্ড <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.65 }}>Farmers Card System</span>
            </div>
          </div>
          <button onClick={() => setShowCard(true)}
            style={{ background: "#064e3b", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7",
              borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#065f46"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#064e3b"; }}>
            View My Card 💳
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(6,78,59,0.55), rgba(15,25,40,0.75))",
          border: "1px solid rgba(16,185,129,0.18)", borderRadius: 16, padding: "18px 22px",
          marginBottom: 18, display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12, animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, border: "2px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>👨‍🌾</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{FARMER.name}</div>
              <div style={{ fontSize: 12, color: "#6ee7b7", opacity: 0.85 }}>{FARMER.nameBn}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                {FARMER.upazila} · {FARMER.district} · {FARMER.category} · {FARMER.land}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>Account Balance</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#6ee7b7" }}>{FARMER.balance}</div>
            <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>Loan due: {FARMER.loanDue}</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.04)",
              border: tab === t.id ? "1px solid rgba(16,185,129,0.45)" : "1px solid rgba(255,255,255,0.07)",
              color: tab === t.id ? "#6ee7b7" : "#94a3b8",
              borderRadius: 10, padding: "7px 15px", cursor: "pointer",
              fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            }}>{t.icon} {t.label}</button>
          ))}
        </nav>

        {tab === "dashboard"  && <Dashboard />}
        {tab === "services"   && <Services />}
        {tab === "crops"      && <Crops />}
        {tab === "blockchain" && <BlockchainLedger />}
        {tab === "advisor"    && <AIAdvisor />}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 20px",
        textAlign: "center", fontSize: 10, color: "#334155", marginTop: 24 }}>
        কৃষক কার্ড · Department of Agricultural Extension · Ministry of Agriculture · Government of Bangladesh
      </footer>
    </div>
  );
}
