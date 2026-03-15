import { useState } from "react";
import { FARMER, WEATHER } from "../data";
import { Modal } from "./ui";

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
  { label: "মোট জমি", value: FARMER.totalLand + " শ.", sub: "নিজ + বর্গা", icon: "🗺️", color: "#0284c7" },
  { label: "চলমান মৌসুম", value: "রবি ২০২৫", sub: "৪টি ফসল নিবন্ধিত", icon: "🌾", color: "#16a34a" },
  { label: "ভর্তুকি ব্যালেন্স", value: FARMER.subsidyBalance, sub: "সার ও বীজ", icon: "💰", color: "#9333ea" },
  { label: "বীমা", value: "সক্রিয়", sub: "ফসল + স্বাস্থ্য", icon: "🛡️", color: "#ea580c" },
];

const QUICK_ACTIONS = [
  { label: "মৌসুমী ঋণের জন্য আবেদন", color: "#0284c7", title: "মৌসুমী ঋণ", details: "কৃষক কার্ডের মাধ্যমে আপনি সহজ শর্তে কৃষি ঋণ পেতে পারেন। ব্যাংক থেকে ৫০,০০০ থেকে ৩,০০,০০০ টাকা পর্যন্ত ঋণ পাওয়া যায়। প্রক্রিয়া সম্পূর্ণ ডিজিটাল।" },
  { label: "প্রাকৃতিক দুর্যোগে ত্রাণ দাবি", color: "#dc2626", title: "দুর্যোগ ত্রাণ", details: "বন্যা, ঘূর্ণিঝড় বা অন্যান্য প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্ত কৃষকরা সরকারি ত্রাণ পেতে পারেন। আবেদন অনলাইনে জমা করুন।" },
  { label: "নতুন ফসল নিবন্ধন", color: "#16a34a", title: "ফসল নিবন্ধন", details: "আপনার জমিতে চাষ করা ফসল নিবন্ধন করুন। এতে সরকারি ভর্তুকি ও প্রণোদনা পেতে সুবিধা হবে।" },
  { label: "সরাসরি বাজার মূল্য দেখুন", color: "#9333ea", title: "বাজার মূল্য", details: "DAM পোর্টাল থেকে সরাসরি আজকের পাইকারি বাজার দেখুন। সবজি, ধান, ডাল, তেলসহ সকল পণ্যের দাম।" },
  { label: "যন্ত্রপাতি বুকিং (ট্র্যাক্টর)", color: "#ea580c", title: "যন্ত্রপাতি ভর্তুকি", details: "ট্র্যাক্টর, হার্ভেস্টারসহ কৃষি যন্ত্রপাতি ভর্তুকিতে পান। উপজেলা কৃষি অফিসে আবেদন করুন।" },
];

export default function Dashboard() {
  const heavyRainDay = WEATHER.find((d) => d.rain > 35);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const openAction = (action) => {
    setSelectedAction(action);
    setModalOpen(true);
  };

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
            🌧 ৭ দিনের বৃষ্টিপূর্ণাঙ্ক পূর্বাভাস (মিমি)
          </div>
          <WeatherBar data={WEATHER} />
          {heavyRainDay && (
            <div style={{
              marginTop: 12, fontSize: 11, color: "#fcd34d",
              background: "rgba(251,191,36,0.08)", borderRadius: 6,
              padding: "6px 10px", border: "1px solid rgba(251,191,36,0.2)",
            }}>
              ⚠ {heavyRainDay.day} তে ভারী বৃষ্টি ({heavyRainDay.rain}মিমি) প্রত্যাশিত — সেচ স্থগিত ও নার্সারি সুরক্ষিত করুন
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, fontWeight: 600 }}>⚡ দ্রুত পদক্ষেপ</div>
          {QUICK_ACTIONS.map((a, i) => (
            <div key={i} onClick={() => openAction(a)} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "9px 12px",
              marginBottom: 8, fontSize: 13, cursor: "pointer", display: "flex",
              alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.06)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              {a.label}
              <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 11 }}>→</span>
            </div>
          ))}
        </div>
      </div>
      {selectedAction && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedAction.title}>
          {selectedAction.details}
        </Modal>
      )}
    </div>
  );
}
