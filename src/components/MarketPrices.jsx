import { useState, useEffect, useCallback } from "react";

const BN = { fontFamily: "'Noto Serif Bengali', 'Hind Siliguri', serif" };
const UI = { fontFamily: "'Hind Siliguri', 'Noto Serif Bengali', sans-serif" };

const DISTRICTS = [
  { en: "Dhaka", bn: "ঢাকা" },
  { en: "Chittagong", bn: "চট্টগ্রাম" },
  { en: "Rajshahi", bn: "রাজশাহী" },
  { en: "Khulna", bn: "খুলনা" },
  { en: "Rangpur", bn: "রংপুর" },
  { en: "Sylhet", bn: "সিলেট" },
  { en: "Barisal", bn: "বরিশাল" },
];

const CATEGORY_COLORS = {
  "ধান/চাল": { bg: "rgba(22,163,74,0.12)", border: "rgba(22,163,74,0.3)", text: "#4ade80" },
  "সবজি": { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#34d399" },
  "ডাল": { bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)", text: "#a78bfa" },
  "তেল": { bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.25)", text: "#fb923c" },
  "মাংস": { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)", text: "#f87171" },
  "মাছ": { bg: "rgba(8,145,178,0.1)", border: "rgba(8,145,178,0.25)", text: "#22d3ee" },
  "ফল": { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)", text: "#fbbf24" },
  "গম": { bg: "rgba(180,83,9,0.1)", border: "rgba(180,83,9,0.25)", text: "#f59e0b" },
  "অন্যান্য": { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", text: "#94a3b8" },
};

const FALLBACK = [
  { nameBn: "মোটা চাল", nameEn: "Coarse Rice", unit: "কেজি", min: 52, max: 56, category: "ধান/চাল" },
  { nameBn: "মাঝারি চাল", nameEn: "Medium Rice", unit: "কেজি", min: 62, max: 68, category: "ধান/চাল" },
  { nameBn: "সরু চাল", nameEn: "Fine Rice", unit: "কেজি", min: 70, max: 78, category: "ধান/চাল" },
  { nameBn: "আটা", nameEn: "Wheat Flour", unit: "কেজি", min: 48, max: 55, category: "গম" },
  { nameBn: "আলু", nameEn: "Potato", unit: "কেজি", min: 28, max: 35, category: "সবজি" },
  { nameBn: "পেঁয়াজ", nameEn: "Onion", unit: "কেজি", min: 55, max: 70, category: "সবজি" },
  { nameBn: "রসুন", nameEn: "Garlic", unit: "কেজি", min: 110, max: 140, category: "সবজি" },
  { nameBn: "টমেটো", nameEn: "Tomato", unit: "কেজি", min: 40, max: 65, category: "সবজি" },
  { nameBn: "বেগুন", nameEn: "Brinjal", unit: "কেজি", min: 40, max: 70, category: "সবজি" },
  { nameBn: "মসুর ডাল", nameEn: "Red Lentil", unit: "কেজি", min: 110, max: 130, category: "ডাল" },
  { nameBn: "মুগ ডাল", nameEn: "Mung Dal", unit: "কেজি", min: 130, max: 155, category: "ডাল" },
  { nameBn: "সয়াবিন তেল", nameEn: "Soybean Oil", unit: "লিটার", min: 155, max: 168, category: "তেল" },
  { nameBn: "পাম তেল", nameEn: "Palm Oil", unit: "লিটার", min: 130, max: 145, category: "তেল" },
  { nameBn: "ব্রয়লার মুরগি", nameEn: "Broiler", unit: "কেজি", min: 170, max: 195, category: "মাংস" },
  { nameBn: "গরুর মাংস", nameEn: "Beef", unit: "কেজি", min: 680, max: 750, category: "মাংস" },
  { nameBn: "ইলিশ মাছ", nameEn: "Hilsha Fish", unit: "কেজি", min: 1200, max: 1600, category: "মাছ" },
  { nameBn: "রুই মাছ", nameEn: "Rui Fish", unit: "কেজি", min: 280, max: 350, category: "মাছ" },
  { nameBn: "কাতলা মাছ", nameEn: "Katla Fish", unit: "কেজি", min: 260, max: 320, category: "মাছ" },
  { nameBn: "কলা", nameEn: "Banana", unit: "ডজন", min: 60, max: 90, category: "ফল" },
  { nameBn: "চিনি", nameEn: "Sugar", unit: "কেজি", min: 118, max: 128, category: "অন্যান্য" },
  { nameBn: "লবণ", nameEn: "Salt", unit: "কেজি", min: 30, max: 38, category: "অন্যান্য" },
];

function PriceTag({ value, unit }) {
  const mid = Math.round((value.min + value.max) / 2);
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ ...UI, fontSize: 16, fontWeight: 700, color: "#f0fdf4", lineHeight: 1 }}>
        ৳{value.min}–{value.max}
      </div>
      <div style={{ ...UI, fontSize: 10, color: "#64748b", marginTop: 2 }}>
        প্রতি {unit} · avg ৳{mid}
      </div>
    </div>
  );
}

export default function MarketPrices() {
  const [district, setDistrict] = useState("Dhaka");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("সব");
  const [lastFetch, setLastFetch] = useState(null);

  const fetch_prices = useCallback(async (d) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market-prices?district=${d}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch {
      // If API fails entirely, use hardcoded fallback
      setData({
        source: "offline",
        date: new Date().toLocaleDateString("bn-BD"),
        district: d,
        note: "সার্ভার সংযোগ করা যাচ্ছে না। সর্বশেষ পরিচিত মূল্য দেখানো হচ্ছে।",
        prices: FALLBACK.map(p => ({ ...p, district: d })),
      });
      setLastFetch(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_prices(district); }, [district, fetch_prices]);

  const categories = ["সব", ...new Set((data?.prices || FALLBACK).map(p => p.category))];
  const filtered = (data?.prices || FALLBACK).filter(
    p => activeCategory === "সব" || p.category === activeCategory
  );

  const districtBn = DISTRICTS.find(d => d.en === district)?.bn || district;

  return (
    <div style={{ animation: "fadeUp 0.3s ease", ...UI }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(8,145,178,0.15), rgba(6,78,59,0.2))",
        border: "1px solid rgba(8,145,178,0.2)",
        borderRadius: 14, padding: "16px 18px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: data?.source === "live" ? "#4ade80" : "#f59e0b",
                boxShadow: data?.source === "live" ? "0 0 6px #4ade80" : "none",
                animation: loading ? "pulse 1s infinite" : "none",
              }} />
              <span style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>
                {loading ? "তথ্য আনা হচ্ছে…" : data?.source === "live" ? "সরাসরি DAM.GOV.BD থেকে" : "সর্বশেষ পরিচিত মূল্য"}
              </span>
            </div>
            <div style={{ ...BN, fontSize: 18, fontWeight: 700, color: "#f0fdf4" }}>
              বাজার মূল্য তালিকা
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              Agricultural Commodity Prices · DAM Bangladesh ·{" "}
              {lastFetch ? lastFetch.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) : "—"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* District selector */}
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, color: "#e2e8f0", padding: "6px 10px", fontSize: 13,
                cursor: "pointer", ...UI,
              }}
            >
              {DISTRICTS.map(d => (
                <option key={d.en} value={d.en} style={{ background: "#1e293b" }}>
                  {d.bn} ({d.en})
                </option>
              ))}
            </select>

            {/* Refresh button */}
            <button
              onClick={() => fetch_prices(district)}
              disabled={loading}
              style={{
                background: "rgba(8,145,178,0.2)", border: "1px solid rgba(8,145,178,0.4)",
                borderRadius: 8, color: "#22d3ee", padding: "6px 12px",
                fontSize: 12, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, fontWeight: 600, ...UI,
              }}
            >
              {loading ? "⏳" : "🔄"} রিফ্রেশ
            </button>
          </div>
        </div>

        {/* Source + error notice */}
        {data?.note && (
          <div style={{
            marginTop: 10, padding: "7px 12px",
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 8, fontSize: 11, color: "#fbbf24", ...UI,
          }}>
            ⚠️ {data.note}
          </div>
        )}

        {/* Source link */}
        {!data?.note && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#475569" }}>
            উৎস:{" "}
            <a href="https://market.dam.gov.bd" target="_blank" rel="noreferrer"
              style={{ color: "#22d3ee", textDecoration: "none" }}>
              market.dam.gov.bd
            </a>{" "}
            · কৃষি বিপণন অধিদপ্তর, বাংলাদেশ · {districtBn} বিভাগ
          </div>
        )}
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {categories.map(cat => {
          const col = CATEGORY_COLORS[cat];
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              background: isActive ? (col?.bg || "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.04)",
              border: `1px solid ${isActive ? (col?.border || "rgba(255,255,255,0.25)") : "rgba(255,255,255,0.07)"}`,
              color: isActive ? (col?.text || "#e2e8f0") : "#64748b",
              borderRadius: 20, padding: "4px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", ...UI,
            }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              height: 68, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.05)",
              animation: "pulse 1.2s ease infinite",
            }} />
          ))}
        </div>
      )}

      {/* Price grid */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
          {filtered.map((item, i) => {
            const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["অন্যান্য"];
            return (
              <div key={i} style={{
                background: col.bg,
                border: `1px solid ${col.border}`,
                borderRadius: 12, padding: "12px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "transform 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div>
                  <div style={{ ...BN, fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>
                    {item.nameBn}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      ...UI, fontSize: 9.5, color: col.text, fontWeight: 600,
                      background: `${col.bg}`, border: `1px solid ${col.border}`,
                      borderRadius: 10, padding: "1px 7px",
                    }}>
                      {item.category}
                    </span>
                    <span style={{ ...UI, fontSize: 10, color: "#64748b" }}>{item.nameEn}</span>
                  </div>
                </div>
                <PriceTag value={item} unit={item.unit} />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{
        marginTop: 14, padding: "10px 14px",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, fontSize: 11, color: "#475569", lineHeight: 1.6, ...UI,
      }}>
        📌 মূল্য প্রতিদিন সকালে DAM পোর্টাল থেকে আপডেট হয়। পাইকারি ও খুচরা উভয় মূল্য অন্তর্ভুক্ত।
        সুনির্দিষ্ট বাজার মূল্যের জন্য <a href="https://market.dam.gov.bd" target="_blank" rel="noreferrer"
          style={{ color: "#22d3ee", textDecoration: "none" }}>market.dam.gov.bd</a> দেখুন।
      </div>
    </div>
  );
}
