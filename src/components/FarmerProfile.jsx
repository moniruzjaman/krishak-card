import { useState, useRef, useCallback } from "react";
import NidOcrCapture from "./NidOcrCapture";
import VoiceAutoFill from "./VoiceAutoFill";
import SignatureCanvas from "react-signature-canvas";
import Webcam from "react-webcam";
// ─── Quick-fill demo profiles ─────────────────────────────────────────────────
const DEMO_PROFILES = {
  small: {
    // Section 1
    name: "মোঃ আবুল রহমান",
    guardianName: "মোঃ আব্দুল করিম",
    gender: "পুরুষ",
    nid: "1987456321098",
    dob: "1978-03-15",
    age: "47",
    education: "মাধ্যমিক (SSC)",
    mobile: "01712345678",
    division: "ঢাকা",
    district: "মুন্সীগঞ্জ",
    upazila: "সিরাজদিখান",
    union: "রাজানগর",
    block: "ব্লক-০৩",
    village: "পূর্বগ্রাম",
    otherOccupation: "না",
    // Section 2
    familyMembers: "5",
    gps: "23.5204° N, 90.4272° E",
    // Section 3
    totalLand: "187",
    mouza: "রাজানগর",
    dagNo: "৪৫২, ৪৫৩",
    khatianNo: "২১৮",
    cultivableLand: "165",
    farmerCategory: "ক্ষুদ্র কৃষক",
    sharecropTaken: "30",
    sharecropGiven: "0",
    robiCrop: "সরিষা, মসুর ডাল",
    kharif1Crop: "আউশ ধান, পাট",
    kharif2Crop: "আমন ধান, কলা",
    orchard: "25",
    // Section 4
    fertilizer: "ইউরিয়া, টিএসপি, এমওপি, জৈব সার",
    seedSource: "BADC ও স্থানীয় বাজার",
    irrigationType: "গভীর নলকূপ (STW)",
    incentiveYear: "2024-25 রবি মৌসুম",
    loanAmount: "৳ 25,000",
    insuranceType: "শস্য বীমা (ধান)",
    warehouseAccess: "হ্যাঁ — উপজেলা গুদাম",
    // Section 5
    pondCount: "2",
    pondArea: "45",
    fishCultivatedArea: "40",
    livestock: "২টি গরু, ৫টি ছাগল",
    farmCount: "1",
  },
  landless: {
    name: "মোসাম্মৎ রহিমা বেগম",
    guardianName: "মোঃ জহির উদ্দিন (স্বামী)",
    gender: "মহিলা",
    nid: "2001789456123",
    dob: "1985-07-20",
    age: "39",
    education: "প্রাথমিক",
    mobile: "01856789012",
    division: "বরিশাল",
    district: "পিরোজপুর",
    upazila: "নাজিরপুর",
    union: "মালিখালী",
    block: "ব্লক-০১",
    village: "দক্ষিণপাড়া",
    otherOccupation: "হ্যাঁ — গৃহকর্মী",
    familyMembers: "4",
    gps: "22.6521° N, 89.9014° E",
    totalLand: "0",
    mouza: "মালিখালী",
    dagNo: "—",
    khatianNo: "—",
    cultivableLand: "35",
    farmerCategory: "ভূমিহীন",
    sharecropTaken: "35",
    sharecropGiven: "0",
    robiCrop: "শাকসবজি, আলু",
    kharif1Crop: "পেয়ারা, সবজি",
    kharif2Crop: "পেয়ারা, আমন ধান",
    orchard: "10",
    fertilizer: "ইউরিয়া, জৈব সার",
    seedSource: "স্থানীয় বাজার",
    irrigationType: "বৃষ্টি নির্ভর",
    incentiveYear: "2024-25 খরিপ মৌসুম",
    loanAmount: "৳ 10,000",
    insuranceType: "শস্য বীমা",
    warehouseAccess: "না",
    pondCount: "1",
    pondArea: "20",
    fishCultivatedArea: "20",
    livestock: "৩টি ছাগল, ১০টি হাঁস",
    farmCount: "0",
  },
};

const SECTION_META = [
  { id: 1, title: "ব্যক্তিগত ও পরিচয় সংক্রান্ত তথ্য", icon: "👤", color: "#0284c7" },
  { id: 2, title: "পারিবারিক ও ভৌগোলিক তথ্য", icon: "🏠", color: "#16a34a" },
  { id: 3, title: "জমির মালিকানা ও চাষাবাদ তথ্য", icon: "🗺️", color: "#9333ea" },
  { id: 4, title: "কৃষি উপকরণ ও আর্থিক তথ্য", icon: "💰", color: "#ea580c" },
  { id: 5, title: "মৎস্য ও গবাদি পশুর তথ্য", icon: "🐄", color: "#0891b2" },
  { id: 6, title: "যাচাইকরণ ও জমা", icon: "✅", color: "#16a34a" },
];

const EMPTY = Object.fromEntries(
  Object.keys(DEMO_PROFILES.small).map((k) => [k, ""])
);

// ─── Reusable field components ────────────────────────────────────────────────
function Field({ label, labelBn, hint, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{labelBn}</span>
        <span style={{ color: "#64748b" }}>/ {label}</span>
        {required && <span style={{ color: "#f87171" }}>*</span>}
      </label>
      {hint && <div style={{ fontSize: 10, color: "#64748b", marginTop: -2 }}>{hint}</div>}
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

function Input({ value, onChange, placeholder, type = "text" }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{ ...inputStyle, borderColor: focus ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)" }}
    />
  );
}

function Select({ value, onChange, options }) {
  const [focus, setFocus] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        ...inputStyle,
        borderColor: focus ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)",
        cursor: "pointer",
      }}
    >
      <option value="" style={{ background: "#1e293b" }}>— নির্বাচন করুন —</option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#1e293b" }}>{o}</option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 2 }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        borderColor: focus ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)",
        resize: "vertical",
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  );
}

function SectionCard({ meta, children, isActive, onToggle, isComplete }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${isActive ? `${meta.color}50` : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, overflow: "hidden", marginBottom: 12,
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: "14px 18px", display: "flex", justifyContent: "space-between",
          alignItems: "center", cursor: "pointer",
          background: isActive ? `${meta.color}12` : "transparent",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "white" : "#cbd5e1" }}>
              {meta.id}. {meta.title}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isComplete && (
            <div style={{
              background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#6ee7b7", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700,
            }}>✓ সম্পন্ন</div>
          )}
          <div style={{ color: "#64748b", fontSize: 16 }}>{isActive ? "▲" : "▼"}</div>
        </div>
      </div>
      {isActive && (
        <div style={{ padding: "16px 18px", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ filled, total }) {
  const pct = Math.round((filled / total) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
        <span>প্রোফাইল সম্পূর্ণতা</span>
        <span style={{ color: pct === 100 ? "#6ee7b7" : "white", fontWeight: 700 }}>{pct}% ({filled}/{total} ঘর)</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10 }}>
        <div style={{
          height: "100%", borderRadius: 10,
          background: pct === 100 ? "#10b981" : pct > 60 ? "#0284c7" : "#f59e0b",
          width: `${pct}%`, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FarmerProfile() {
  const [form, setForm] = useState(EMPTY);
  const [activeSection, setActiveSection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);

  const sigCanvas = useRef(null);
  const webcamRef = useRef(null);
  const [showSigCanvas, setShowSigCanvas] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [fingerProgress, setFingerProgress] = useState(0);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const img = webcamRef.current.getScreenshot();
      if (img) {
        setPhotoTaken(true);
        setShowWebcam(false);
      }
    }
  }, [webcamRef]);

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setSignatureDone(true);
      setShowSigCanvas(false);
    }
  };

  const startFingerprintScan = () => {
    setShowFingerprint(true);
    setFingerProgress(0);
    const interval = setInterval(() => {
      setFingerProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setBiometric(true);
          setTimeout(() => setShowFingerprint(false), 500);
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };


  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const filledCount = Object.values(form).filter((v) => v && v.trim() !== "").length +
    (biometric ? 1 : 0) + (photoTaken ? 1 : 0) + (signatureDone ? 1 : 0);
  const totalFields = Object.keys(EMPTY).length + 3;

  function fillDemo(type) {
    setForm(DEMO_PROFILES[type]);
    setBiometric(true);
    setPhotoTaken(true);
    setSignatureDone(true);
  }

  function handleOcrData(data) {
    setForm(f => ({
      ...f,
      name: data.name || f.name,
      dob: data.dob || f.dob,
      nid: data.nid || f.nid,
      division: data.address?.division || f.division,
      district: data.address?.district || f.district,
      upazila: data.address?.upazila || f.upazila,
      union: data.address?.municipality || data.address?.postOffice || f.union,
      village: data.address?.village || f.village,
    }));
  }

  function handleVoiceFill(data) {
    setForm(f => {
      const merged = { ...f };
      Object.keys(data).forEach(k => {
        if (data[k]) merged[k] = data[k];
      });
      return merged;
    });
  }

  function handleSubmit() {
    const uid = `KC-${form.district?.slice(0,2).toUpperCase() || "XX"}-${Date.now().toString().slice(-6)}`;
    setSubmitted({ ...form, uid, submittedAt: new Date().toLocaleString("bn-BD") });
  }

  if (submitted) {
    return (
      <div style={{ animation: "fadeUp 0.4s ease" }}>
        <div style={{
          background: "rgba(6,78,59,0.3)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7", marginBottom: 6 }}>
            প্রোফাইল সফলভাবে জমা হয়েছে!
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
            আপনার কৃষক কার্ড ইউনিক আইডি:
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: 28, fontWeight: 800,
            color: "white", letterSpacing: 3, background: "rgba(0,0,0,0.3)",
            borderRadius: 12, padding: "14px 24px", display: "inline-block",
            border: "1px solid rgba(16,185,129,0.3)",
          }}>{submitted.uid}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
            জমার সময়: {submitted.submittedAt}
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: 18, marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#94a3b8" }}>📋 প্রোফাইল সারসংক্ষেপ</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["নাম", submitted.name],
              ["জাতীয় পরিচয়পত্র", submitted.nid],
              ["মোবাইল", submitted.mobile],
              ["জেলা/উপজেলা", `${submitted.district} / ${submitted.upazila}`],
              ["কৃষক শ্রেণী", submitted.farmerCategory],
              ["মোট জমি", `${submitted.totalLand} শতাংশ`],
              ["প্রধান ফসল", submitted.kharif2Crop],
              ["ঋণের পরিমাণ", submitted.loanAmount],
            ].map(([k, v], i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setForm(EMPTY); setSubmitted(false); setBiometric(false); setPhotoTaken(false); setSignatureDone(false); setActiveSection(1); }}
          style={{
            width: "100%", background: "#065f46", border: "1px solid rgba(16,185,129,0.3)",
            color: "#6ee7b7", borderRadius: 12, padding: "12px", cursor: "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >নতুন কৃষক নিবন্ধন করুন →</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: 18, marginBottom: 16,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
          📋 কৃষকের ইলেকট্রনিক প্রোফাইল নিবন্ধন
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 }}>
          তথ্য সংগৃহীত হয় BBS, DAE এবং সরেজমিন মাঠ থেকে। সকল ৩১টি তথ্য পূরণ করুন।
          নিচের "নমুনা তথ্য দিয়ে পূরণ করুন" বাটন ব্যবহার করে ফর্মটি দ্রুত পরীক্ষা করতে পারেন।
        </div>

        {/* Quick fill buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>⚡ দ্রুত পূরণ:</div>
          <button onClick={() => fillDemo("small")} style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            color: "#6ee7b7", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12,
          }}>ক্ষুদ্র কৃষক (নমুনা)</button>
          <button onClick={() => fillDemo("landless")} style={{
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
            color: "#c4b5fd", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12,
          }}>ভূমিহীন কৃষাণী (নমুনা)</button>
          <button onClick={() => { setForm(EMPTY); setBiometric(false); setPhotoTaken(false); setSignatureDone(false); }} style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12,
          }}>ফর্ম পরিষ্কার করুন</button>
        </div>
      </div>

      <ProgressBar filled={filledCount} total={totalFields} />
      
      <VoiceAutoFill onFill={handleVoiceFill} />

      {/* ── Section 1: Personal ── */}
      <SectionCard
        meta={SECTION_META[0]}
        isActive={activeSection === 1}
        onToggle={() => setActiveSection(activeSection === 1 ? null : 1)}
        isComplete={!!(form.name && form.nid && form.mobile && form.division)}
      >
        <NidOcrCapture onDataExtracted={handleOcrData} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field labelBn="কৃষক/কৃষাণীর নাম" label="Full Name" required>
            <Input value={form.name} onChange={set("name")} placeholder="বাংলায় পূর্ণ নাম লিখুন" />
          </Field>
          <Field labelBn="পিতা/মাতা/স্বামী/স্ত্রীর নাম" label="Guardian Name" required>
            <Input value={form.guardianName} onChange={set("guardianName")} placeholder="সম্পর্ক সহ নাম" />
          </Field>
          <Field labelBn="লিঙ্গ" label="Gender" required>
            <Select value={form.gender} onChange={set("gender")} options={["পুরুষ", "মহিলা", "অন্যান্য"]} />
          </Field>
          <Field labelBn="জাতীয় পরিচয়পত্র নম্বর" label="NID Number" required hint="১৩ বা ১৭ সংখ্যার এনআইডি">
            <Input value={form.nid} onChange={set("nid")} placeholder="NID নম্বর" />
          </Field>
          <Field labelBn="জন্ম তারিখ" label="Date of Birth" required>
            <Input value={form.dob} onChange={set("dob")} type="date" placeholder="" />
          </Field>
          <Field labelBn="বর্তমান বয়স" label="Age">
            <Input value={form.age} onChange={set("age")} placeholder="বছর" />
          </Field>
          <Field labelBn="শিক্ষাগত যোগ্যতা" label="Education">
            <Select value={form.education} onChange={set("education")} options={["নিরক্ষর", "প্রাথমিক", "মাধ্যমিক (SSC)", "উচ্চ মাধ্যমিক (HSC)", "স্নাতক ও তদূর্ধ্ব"]} />
          </Field>
          <Field labelBn="মোবাইল নম্বর" label="Mobile" required hint="সক্রিয় মোবাইল নম্বর">
            <Input value={form.mobile} onChange={set("mobile")} placeholder="01X-XXXXXXXX" />
          </Field>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>ঠিকানা (Address)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field labelBn="বিভাগ" label="Division" required>
            <Select value={form.division} onChange={set("division")} options={["ঢাকা","চট্টগ্রাম","রাজশাহী","খুলনা","বরিশাল","সিলেট","রংপুর","ময়মনসিংহ"]} />
          </Field>
          <Field labelBn="জেলা" label="District" required>
            <Input value={form.district} onChange={set("district")} placeholder="জেলার নাম" />
          </Field>
          <Field labelBn="উপজেলা" label="Upazila" required>
            <Input value={form.upazila} onChange={set("upazila")} placeholder="উপজেলার নাম" />
          </Field>
          <Field labelBn="ইউনিয়ন/পৌরসভা" label="Union/Municipality">
            <Input value={form.union} onChange={set("union")} placeholder="ইউনিয়নের নাম" />
          </Field>
          <Field labelBn="ব্লক" label="Block">
            <Input value={form.block} onChange={set("block")} placeholder="ব্লক নম্বর/নাম" />
          </Field>
          <Field labelBn="গ্রাম/মহল্লা" label="Village/Ward">
            <Input value={form.village} onChange={set("village")} placeholder="গ্রামের নাম" />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Field labelBn="অন্যান্য পেশা" label="Other Occupation" hint="কৃষি ছাড়া অন্য পেশায় যুক্ত কি না">
            <Select value={form.otherOccupation} onChange={set("otherOccupation")} options={["না", "হ্যাঁ — দিনমজুর", "হ্যাঁ — ব্যবসা", "হ্যাঁ — গৃহকর্মী", "হ্যাঁ — অন্যান্য"]} />
          </Field>
        </div>

        <button onClick={() => setActiveSection(2)} style={nextBtnStyle}>পরবর্তী বিভাগ →</button>
      </SectionCard>

      {/* ── Section 2: Family & Geography ── */}
      <SectionCard
        meta={SECTION_META[1]}
        isActive={activeSection === 2}
        onToggle={() => setActiveSection(activeSection === 2 ? null : 2)}
        isComplete={!!(form.familyMembers && form.gps)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field labelBn="পরিবারের মোট সদস্য সংখ্যা" label="Family Members" required>
            <Input value={form.familyMembers} onChange={set("familyMembers")} placeholder="সংখ্যা লিখুন" />
          </Field>
          <Field labelBn="বাসার GPS লোকেশন" label="GPS Location" hint="মোবাইলে GPS চালু করে স্বয়ংক্রিয়ভাবে নিন">
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={form.gps}
                onChange={(e) => set("gps")(e.target.value)}
                placeholder="latitude, longitude"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => set("gps")(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`),
                      () => set("gps")("GPS অ্যাক্সেস পাওয়া যায়নি")
                    );
                  }
                }}
                style={{
                  background: "#0284c7", border: "none", color: "white",
                  borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
                }}
              >📍 নিন</button>
            </div>
          </Field>
        </div>
        <button onClick={() => setActiveSection(3)} style={nextBtnStyle}>পরবর্তী বিভাগ →</button>
      </SectionCard>

      {/* ── Section 3: Land ── */}
      <SectionCard
        meta={SECTION_META[2]}
        isActive={activeSection === 3}
        onToggle={() => setActiveSection(activeSection === 3 ? null : 3)}
        isComplete={!!(form.cultivableLand && form.farmerCategory && form.kharif2Crop)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field labelBn="মোট জমির পরিমাণ" label="Total Land (decimal)" required>
            <Input value={form.totalLand} onChange={set("totalLand")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="মৌজার নাম" label="Mouza">
            <Input value={form.mouza} onChange={set("mouza")} placeholder="মৌজা" />
          </Field>
          <Field labelBn="দাগ নম্বর" label="Dag Number">
            <Input value={form.dagNo} onChange={set("dagNo")} placeholder="দাগ নং" />
          </Field>
          <Field labelBn="খতিয়ান নম্বর" label="Khatian Number">
            <Input value={form.khatianNo} onChange={set("khatianNo")} placeholder="খতিয়ান নং" />
          </Field>
          <Field labelBn="মোট আবাদী জমি" label="Cultivable Land (decimal)" required>
            <Input value={form.cultivableLand} onChange={set("cultivableLand")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="কৃষকের শ্রেণী" label="Farmer Category" required>
            <Select value={form.farmerCategory} onChange={set("farmerCategory")} options={["ভূমিহীন", "প্রান্তিক কৃষক", "ক্ষুদ্র কৃষক", "মাঝারি কৃষক", "বড় কৃষক"]} />
          </Field>
          <Field labelBn="বর্গা নেওয়া জমি" label="Sharecrop Taken (decimal)" hint="অন্যের জমি বর্গা নিয়েছেন">
            <Input value={form.sharecropTaken} onChange={set("sharecropTaken")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="বর্গা দেওয়া জমি" label="Sharecrop Given (decimal)" hint="নিজের জমি বর্গা দিয়েছেন">
            <Input value={form.sharecropGiven} onChange={set("sharecropGiven")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="ফলবাগান/নার্সারি" label="Orchard/Nursery (decimal)">
            <Input value={form.orchard} onChange={set("orchard")} placeholder="শতাংশ" />
          </Field>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>মৌসুম ভিত্তিক ফসল (Seasonal Crops)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field labelBn="রবি মৌসুম" label="Rabi (Nov–Mar)">
            <Textarea value={form.robiCrop} onChange={set("robiCrop")} placeholder="যেমন: সরিষা, গম, মসুর" />
          </Field>
          <Field labelBn="খরিপ-০১ মৌসুম" label="Kharif-1 (Mar–Jul)">
            <Textarea value={form.kharif1Crop} onChange={set("kharif1Crop")} placeholder="যেমন: আউশ ধান, পাট" />
          </Field>
          <Field labelBn="খরিপ-০২ মৌসুম" label="Kharif-2 (Jul–Nov)" required>
            <Textarea value={form.kharif2Crop} onChange={set("kharif2Crop")} placeholder="যেমন: আমন ধান, কলা" />
          </Field>
        </div>
        <button onClick={() => setActiveSection(4)} style={nextBtnStyle}>পরবর্তী বিভাগ →</button>
      </SectionCard>

      {/* ── Section 4: Inputs & Finance ── */}
      <SectionCard
        meta={SECTION_META[3]}
        isActive={activeSection === 4}
        onToggle={() => setActiveSection(activeSection === 4 ? null : 4)}
        isComplete={!!(form.fertilizer && form.irrigationType)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field labelBn="ব্যবহৃত সারের ধরন" label="Fertilizers Used" hint="ইউরিয়া, টিএসপি, এমওপি, ডিএপি, জৈব সার">
            <Textarea value={form.fertilizer} onChange={set("fertilizer")} placeholder="যেমন: ইউরিয়া, টিএসপি, এমওপি" />
          </Field>
          <Field labelBn="বীজের উৎস" label="Seed Source">
            <Select value={form.seedSource} onChange={set("seedSource")} options={["BADC","BARI/BRRI প্রত্যায়িত","স্থানীয় বাজার","নিজস্ব সংরক্ষিত","BADC ও স্থানীয় বাজার"]} />
          </Field>
          <Field labelBn="সেচ ব্যবস্থার ধরন" label="Irrigation Type" required>
            <Select value={form.irrigationType} onChange={set("irrigationType")} options={["গভীর নলকূপ (DTW)","অগভীর নলকূপ (STW)","বৃষ্টি নির্ভর","ড্রিপ সেচ","স্প্রিংকলার","বন্যা সেচ"]} />
          </Field>
          <Field labelBn="প্রণোদনা/পুনর্বাসন" label="Govt Incentive Year">
            <Input value={form.incentiveYear} onChange={set("incentiveYear")} placeholder="বছর ও মৌসুম উল্লেখ করুন" />
          </Field>
          <Field labelBn="কৃষি ঋণের পরিমাণ" label="Agri Loan Amount" hint="মৌসুমী ঋণ">
            <Input value={form.loanAmount} onChange={set("loanAmount")} placeholder="৳ টাকার পরিমাণ" />
          </Field>
          <Field labelBn="বীমার ধরন" label="Insurance Type" hint="শস্য, পশু বা মৎস্য বীমা">
            <Select value={form.insuranceType} onChange={set("insuranceType")} options={["শস্য বীমা (ধান)","শস্য বীমা (সবজি)","পশু বীমা","মৎস্য বীমা","শস্য বীমা","নেই"]} />
          </Field>
          <Field labelBn="শস্য গুদামজাতকরণ" label="Warehouse Access">
            <Select value={form.warehouseAccess} onChange={set("warehouseAccess")} options={["হ্যাঁ — উপজেলা গুদাম","হ্যাঁ — বেসরকারি গুদাম","না"]} />
          </Field>
        </div>
        <button onClick={() => setActiveSection(5)} style={nextBtnStyle}>পরবর্তী বিভাগ →</button>
      </SectionCard>

      {/* ── Section 5: Fish & Livestock ── */}
      <SectionCard
        meta={SECTION_META[4]}
        isActive={activeSection === 5}
        onToggle={() => setActiveSection(activeSection === 5 ? null : 5)}
        isComplete={!!(form.livestock)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field labelBn="জলাশয়ের সংখ্যা" label="Number of Ponds">
            <Input value={form.pondCount} onChange={set("pondCount")} placeholder="পুকুর/দিঘির সংখ্যা" />
          </Field>
          <Field labelBn="জলাশয়ের মোট আয়তন" label="Total Pond Area (decimal)">
            <Input value={form.pondArea} onChange={set("pondArea")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="মাছ চাষকৃত জলাশয়" label="Fish Cultivated Area (decimal)">
            <Input value={form.fishCultivatedArea} onChange={set("fishCultivatedArea")} placeholder="শতাংশ" />
          </Field>
          <Field labelBn="গবাদি পশুর সংখ্যা ও ধরন" label="Livestock">
            <Textarea value={form.livestock} onChange={set("livestock")} placeholder="যেমন: ২টি গরু, ৫টি ছাগল, ১০টি মুরগি" />
          </Field>
          <Field labelBn="খামারের সংখ্যা" label="Number of Farms">
            <Input value={form.farmCount} onChange={set("farmCount")} placeholder="খামার সংখ্যা" />
          </Field>
        </div>
        <button onClick={() => setActiveSection(6)} style={nextBtnStyle}>পরবর্তী বিভাগ →</button>
      </SectionCard>

      {/* ── Section 6: Verification ── */}
      <SectionCard
        meta={SECTION_META[5]}
        isActive={activeSection === 6}
        onToggle={() => setActiveSection(activeSection === 6 ? null : 6)}
        isComplete={biometric && photoTaken && signatureDone}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Signature */}
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 16, textAlign: "center",
            border: signatureDone ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
          }}>
            {!showSigCanvas && !signatureDone ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>কৃষকের স্বাক্ষর</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Farmer Signature</div>
                <button
                  onClick={() => setShowSigCanvas(true)}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12,
                  }}
                >স্বাক্ষর করুন</button>
              </>
            ) : showSigCanvas ? (
              <div style={{ background: "white", borderRadius: 8, padding: 4 }}>
                <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ width: 200, height: 100, className: 'sigCanvas' }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => sigCanvas.current.clear()} style={{ flex: 1, padding: 4, fontSize: 11 }}>মুছুন</button>
                  <button onClick={saveSignature} style={{ flex: 1, padding: 4, background: "#16a34a", color: "white", border: "none", borderRadius: 4, fontSize: 11 }}>সংরক্ষণ</button>
                </div>
              </div>
            ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", marginBottom: 16 }}>স্বাক্ষর সম্পন্ন</div>
                  <button onClick={() => { setSignatureDone(false); setShowSigCanvas(true); }} style={{ background: "transparent", border: "1px solid rgba(16,185,16,0.3)", color: "#6ee7b7", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>পরিবর্তন করুন</button>
                </>
            )}
          </div>

          {/* Biometric */}
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 16, textAlign: "center",
            border: biometric ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
          }}>
            {!showFingerprint && !biometric ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>👆</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>বায়োমেট্রিক ফিঙ্গারপ্রিন্ট</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Fingerprint Scan</div>
                <button
                  onClick={startFingerprintScan}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12,
                  }}
                >আঙুল স্ক্যান করুন</button>
              </>
            ) : showFingerprint ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 32, animation: "pulse 1s infinite" }}>🖐️</div>
                <div style={{ fontSize: 11, color: "#e2e8f0", marginTop: 8 }}>স্ক্যান হচ্ছে...</div>
                <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.1)", marginTop: 8, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${fingerProgress}%`, background: "#10b981", transition: "width 0.3s" }}></div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", marginBottom: 16 }}>স্ক্যান সম্পন্ন</div>
              </>
            )}
          </div>

          {/* Photo */}
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 16, textAlign: "center",
            border: photoTaken ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
          }}>
            {!showWebcam && !photoTaken ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>কৃষকের ছবি</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Passport Photo</div>
                <button
                  onClick={() => setShowWebcam(true)}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12,
                  }}
                >ছবি তুলুন</button>
              </>
            ) : showWebcam ? (
              <div style={{ borderRadius: 8, overflow: "hidden" }}>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" videoConstraints={{ facingMode: "user" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => setShowWebcam(false)} style={{ flex: 1, padding: 4, fontSize: 11 }}>বাতিল</button>
                  <button onClick={capturePhoto} style={{ flex: 1, padding: 4, background: "#0284c7", color: "white", border: "none", borderRadius: 4, fontSize: 11 }}>SNAP</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", marginBottom: 16 }}>ছবি তোলা হয়েছে</div>
                <button onClick={() => { setPhotoTaken(false); setShowWebcam(true); }} style={{ background: "transparent", border: "1px solid rgba(16,185,16,0.3)", color: "#6ee7b7", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>পরিবর্তন করুন</button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{
            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 10, padding: 14, fontSize: 12, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6,
          }}>
            ✅ এই তথ্যগুলি BBS, DAE এবং সরেজমিন মাঠ থেকে যাচাই করা হবে। সকল তথ্য সত্য ও সঠিক বলে ঘোষণা করছি।
            প্রদত্ত তথ্য ব্লকচেইন লেজারে সংরক্ষিত হবে এবং ইউনিক কৃষক আইডি (Krishok Card ID) তৈরি হবে।
          </div>

          <button
            onClick={handleSubmit}
            disabled={!(signatureDone && biometric && photoTaken && form.name && form.nid)}
            style={{
              width: "100%", padding: "14px",
              background: (signatureDone && biometric && photoTaken && form.name && form.nid)
                ? "linear-gradient(135deg, #16a34a, #059669)"
                : "rgba(255,255,255,0.06)",
              border: "none", color: "white", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: (signatureDone && biometric && photoTaken && form.name && form.nid) ? "pointer" : "not-allowed",
              opacity: (signatureDone && biometric && photoTaken && form.name && form.nid) ? 1 : 0.5,
              transition: "all 0.2s",
            }}
          >
            🌾 কৃষক কার্ড প্রোফাইল জমা দিন
          </button>
          {!(form.name && form.nid) && (
            <div style={{ fontSize: 11, color: "#f87171", textAlign: "center", marginTop: 8 }}>
              জমা দিতে অন্তত নাম, NID, মোবাইল নম্বর এবং তিনটি যাচাইকরণ সম্পন্ন করুন।
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

const nextBtnStyle = {
  marginTop: 16, background: "rgba(16,185,129,0.12)",
  border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7",
  borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13,
  fontWeight: 600, float: "right",
};
