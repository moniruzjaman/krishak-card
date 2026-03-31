import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "regenerator-runtime/runtime";

export default function VoiceAutoFill({ onFill }) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!browserSupportsSpeechRecognition) {
    return <div style={{ fontSize: 11, color: "#f87171" }}>ব্রাউজারে ভয়েস সাপোর্ট নেই (ক্রোম ব্যবহার করুন)</div>;
  }

  const handleStart = () => {
    setError("");
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "bn-BD" });
  };

  const handleStop = async () => {
    SpeechRecognition.stopListening();
    if (!transcript.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are an AI assistant that extracts farmer registration data from Bangla text.
Extract the relevant details and map them exactly to these JSON keys only (leave null if not found):
- name
- guardianName
- gender (পুরুষ/মহিলা/অন্যান্য)
- nid
- dob (YYYY-MM-DD or parse from age)
- age
- education
- mobile
- division
- district
- upazila
- union
- block
- village
- otherOccupation
- familyMembers
- totalLand
- cultivableLand
- farmerCategory (ভূমিহীন/প্রান্তিক কৃষক/ক্ষুদ্র কৃষক/মাঝারি কৃষক/বড় কৃষক)
- robiCrop
- kharif1Crop
- kharif2Crop
- fertilizer
- irrigationType
- loanAmount
- livestock

Respond ONLY with a valid JSON object. No markdown, no extra text.`,
          messages: [{ role: "user", content: transcript }]
        })
      });

      if (!response.ok) throw new Error("API Error");
      
      const { text } = await response.json();
      const parsed = JSON.parse(text); // parse JSON
      onFill(parsed);
    } catch (err) {
      console.error(err);
      setError("ডেটা প্রসেস করতে ত্রুটি হয়েছে।");
    } finally {
      setProcessing(false);
      resetTranscript();
    }
  };

  return (
    <div style={{
      background: "rgba(16,185,129,0.1)",
      border: "1px solid rgba(16,185,129,0.3)",
      borderRadius: 12, padding: "14px", marginBottom: "16px",
      display: "flex", flexDirection: "column", gap: 8
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6ee7b7", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>🎙️</span> ভয়েস অটো-ফিল (কৃত্রিম বুদ্ধিমত্তা)
        </div>
      </div>
      
      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
        আপনার তথ্য মুখে বলুন। যেমন: "আমার নাম করিম, মোবাইল নাম্বার ০১৭১২৩৪৫৬৭৮, আমার ২ একর জমি আছে..."
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {!listening ? (
          <button
            onClick={handleStart}
            disabled={processing}
            style={{
              background: "#16a34a", color: "white", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.6 : 1
            }}
          >
            {processing ? "⏳ প্রসেসিং..." : "রেকর্ড শুরু করুন"}
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              background: "#dc2626", color: "white", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", animation: "pulse 1.5s infinite"
            }}
          >
            ⏹️ রেকর্ড থামান
          </button>
        )}
      </div>

      {listening && (
        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: 8, fontSize: 13, color: "#cbd5e1", minHeight: 40 }}>
          {transcript || "শুনছি..."}
        </div>
      )}
      
      {error && <div style={{ fontSize: 11, color: "#f87171" }}>{error}</div>}
    </div>
  );
}
