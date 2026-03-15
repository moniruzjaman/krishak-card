import { useState, useEffect } from "react";
import { FARMER } from "./data";
import FarmersCard from "./components/FarmersCard";
import Dashboard from "./components/Dashboard";
import Services from "./components/Services";
import MarketPrices from "./components/MarketPrices";
import Crops from "./components/Crops";
import { BlockchainLedger } from "./components/BlockchainLedger";
import AIAdvisor from "./components/AIAdvisor";
import FarmerProfile from "./components/FarmerProfile";

const TABS = [
  { id: "dashboard",  label: "ড্যাশবোর্ড",   labelEn: "Dashboard",   icon: "🏠" },
  { id: "services",   label: "সেবাসমূহ",       labelEn: "Services",    icon: "⚡" },
  { id: "market",     label: "বাজার মূল্য",    labelEn: "Market",      icon: "📊" },
  { id: "crops",      label: "আমার ফসল",       labelEn: "My Crops",    icon: "🌾" },
  { id: "profile",    label: "নিবন্ধন",         labelEn: "Profile",     icon: "📋" },
  { id: "blockchain", label: "লেজার",           labelEn: "Ledger",      icon: "🔗" },
  { id: "advisor",    label: "AI উপদেষ্টা",    labelEn: "AI Advisor",  icon: "🤖" },
];

const BN = { fontFamily: "'Noto Serif Bengali', serif" };
const UI = { fontFamily: "'Hind Siliguri', sans-serif" };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setShowCard(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      ...UI,
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        body { background: #0f172a; font-family: 'Hind Siliguri', 'Noto Serif Bengali', sans-serif; }

        @keyframes popIn  { from { transform: scale(0.88) translateY(18px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }

        /* Markdown content */
        .md-content p  { margin: 0 0 8px; font-family: 'Hind Siliguri', sans-serif; }
        .md-content ul { padding-left: 18px; margin: 0 0 8px; }
        .md-content li { margin-bottom: 3px; font-family: 'Hind Siliguri', sans-serif; }
        .md-content strong { color: #a7f3d0; }
        .md-content code { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 12px; }

        /* Form elements */
        input, textarea, select { font-family: 'Hind Siliguri', 'Noto Serif Bengali', sans-serif !important; }
        input::placeholder { color: #475569; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {showCard && <FarmersCard onClose={() => setShowCard(false)} />}

      {/* ── Header ── */}
      <header style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #0a3d2e 100%)",
        borderBottom: "1px solid rgba(16,185,129,0.18)",
        padding: "13px 20px",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 8.5, letterSpacing: 2.5, opacity: 0.5, marginBottom: 3, ...UI }}>
              কৃষি সম্প্রসারণ অধিদপ্তর · DEPT. OF AGRICULTURAL EXTENSION · GOV'T OF BANGLADESH
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ ...BN, fontSize: 22, fontWeight: 900 }}>কৃষক কার্ড</span>
              <span style={{ ...UI, fontSize: 13, fontWeight: 400, opacity: 0.55 }}>Farmers Card System</span>
            </div>
          </div>

          {/* Card button */}
          <button
            onClick={() => setShowCard(true)}
            style={{
              background: "linear-gradient(135deg, #166534, #15803d)",
              border: "1px solid rgba(110,231,183,0.35)",
              color: "#6ee7b7", borderRadius: 11,
              padding: "9px 18px", cursor: "pointer",
              fontSize: 13, fontWeight: 700, ...UI,
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#14532d,#166534)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#166534,#15803d)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)"; }}
          >
            <span>💳</span> কার্ড দেখুন
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 940, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Farmer Banner ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(6,78,59,0.55), rgba(15,25,40,0.8))",
          border: "1px solid rgba(16,185,129,0.18)", borderRadius: 16,
          padding: "18px 22px", marginBottom: 18,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12,
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, border: "2px solid rgba(255,255,255,0.12)", flexShrink: 0,
            }}>👨‍🌾</div>
            <div>
              <div style={{ ...BN, fontSize: 18, fontWeight: 700 }}>{FARMER.nameBn}</div>
              <div style={{ ...UI, fontSize: 12, color: "#6ee7b7", opacity: 0.85 }}>{FARMER.name}</div>
              <div style={{ ...UI, fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                {FARMER.address?.upazila} · {FARMER.address?.district} · {FARMER.categoryBn} · {FARMER.totalLand} শতাংশ
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...UI, fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>কার্ড ব্যালেন্স</div>
            <div style={{ ...BN, fontSize: 26, fontWeight: 800, color: "#6ee7b7" }}>{FARMER.balance}</div>
            <div style={{ ...UI, fontSize: 11, color: "#f87171", marginTop: 4 }}>ঋণ বাকি: {FARMER.loanDue}</div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <nav style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.04)",
              border: tab === t.id ? "1px solid rgba(16,185,129,0.45)" : "1px solid rgba(255,255,255,0.07)",
              color: tab === t.id ? "#6ee7b7" : "#94a3b8",
              borderRadius: 10, padding: "7px 14px",
              cursor: "pointer", fontSize: 12.5, fontWeight: 600,
              whiteSpace: "nowrap", ...UI,
              transition: "all 0.18s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* ── Tab panels ── */}
        {tab === "dashboard"  && <Dashboard/>}
        {tab === "services"   && <Services/>}
        {tab === "market"     && <MarketPrices/>}
        {tab === "crops"      && <Crops/>}
        {tab === "profile"    && <FarmerProfile/>}
        {tab === "blockchain" && <BlockchainLedger/>}
        {tab === "advisor"    && <AIAdvisor/>}
      </main>

      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "14px 20px", textAlign: "center",
        fontSize: 11, color: "#334155", marginTop: 24, ...UI,
      }}>
        কৃষক কার্ড · কৃষি সম্প্রসারণ অধিদপ্তর · কৃষি মন্ত্রণালয় · গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
      </footer>
    </div>
  );
}
