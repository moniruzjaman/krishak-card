import { useState, useRef, useEffect } from 'react';

/**
 * Dual NID Capture – captures front AND back of NID,
 * then runs OCR on both sides and auto-fills the form.
 *
 * Props:
 *   onDataExtracted(parsed)  – called with the merged OCR result
 */
export default function NidOcrCapture({ onDataExtracted }) {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState('front'); // 'front' | 'back' | 'review'
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [stream, setStream] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [currentCapture, setCurrentCapture] = useState(null); // preview before confirm
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  /* ─── camera helpers ──────────────────────────────────────────────── */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setMode('camera');
      setError(null);
    } catch {
      setError('ক্যামেরা চালু করা যাচ্ছে না। দয়া করে ফাইল আপলোড ব্যবহার করুন।');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      setCurrentCapture(canvas.toDataURL('image/jpeg', 0.8));
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCurrentCapture(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ─── step navigation ─────────────────────────────────────────────── */
  const confirmCapture = () => {
    if (step === 'front') {
      setFrontImage(currentCapture);
    } else {
      setBackImage(currentCapture);
    }
    setCurrentCapture(null);
    if (step === 'front') {
      setStep('back');
      // auto-start camera for back
      setTimeout(() => startCamera(), 100);
    } else {
      setStep('review');
    }
  };

  const retakeCurrent = () => {
    setCurrentCapture(null);
    setError(null);
    if (mode === 'camera') startCamera();
  };

  const goBackToFront = () => {
    setFrontImage(null);
    setStep('front');
    setError(null);
    startCamera();
  };

  const goBackToBack = () => {
    setBackImage(null);
    setStep('back');
    setError(null);
    startCamera();
  };

  const resetAll = () => {
    stopCamera();
    setFrontImage(null);
    setBackImage(null);
    setCurrentCapture(null);
    setStep('front');
    setError(null);
    setIsActive(false);
  };

  /* ─── OCR processing on BOTH sides ────────────────────────────────── */
  const processBothImages = async () => {
    if (!frontImage || !backImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const Tesseract = (await import('tesseract.js')).default;

      // Run OCR on both images in parallel
      const [frontResult, backResult] = await Promise.all([
        Tesseract.recognize(frontImage, 'ben+eng'),
        Tesseract.recognize(backImage, 'ben+eng'),
      ]);

      const frontText = frontResult.data.text;
      const backText = backResult.data.text;

      // Send combined text to AI for structured parsing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are an AI that extracts data from Bangladeshi NID card OCR text.
You will receive text from TWO sides of an NID card.

SIDE 1 (FRONT) typically contains: name, father's name/husband's name, date of birth, NID number.
SIDE 2 (BACK) typically contains: mother's name, blood group, address details, issue date.

Extract these fields as JSON (leave null if missing):
- name (Bangla full name)
- fatherName (Bangla father/husband name)
- motherName (Bangla mother name)
- dob (YYYY-MM-DD or parseable date of birth)
- nid (10, 13, or 17 digit ID number)
- bloodGroup (e.g. O+, A+, B+)
- address (object with: village, postOffice, upazila, municipality, district, division)
Return ONLY raw JSON, no markdown formatting, no code blocks.`,
          messages: [
            {
              role: 'user',
              content: `SIDE 1 (FRONT OF NID):\n${frontText}\n\nSIDE 2 (BACK OF NID):\n${backText}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('AI parsing failed');
      const { text: jsonStr } = await response.json();

      // Try to parse - handle possible markdown code blocks
      let cleaned = jsonStr.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      const parsed = JSON.parse(cleaned);

      if (parsed) {
        onDataExtracted(parsed);
        resetAll();
      } else {
        throw new Error('Processing failed');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('তথ্য স্ক্যান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা ম্যানুয়ালি পূরণ করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ─── Inactive: show launch button ────────────────────────────────── */
  if (!isActive) {
    return (
      <button
        onClick={() => {
          setIsActive(true);
          setStep('front');
          startCamera();
        }}
        style={{
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#6ee7b7',
          borderRadius: 8,
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <span>📷</span> NID কার্ড স্ক্যান করুন (সামনে + পিছনে — Auto-fill)
      </button>
    );
  }

  /* ─── Step indicator ──────────────────────────────────────────────── */
  const stepIndicator = (num, label, done) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: done ? 1 : 0.5 }}>
      <div
        style={{
          width: 26, height: 26, borderRadius: '50%',
          background: done ? '#10b981' : 'rgba(255,255,255,0.08)',
          border: done ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: done ? 'white' : '#94a3b8',
          flexShrink: 0,
        }}
      >
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: 12, color: done ? '#6ee7b7' : '#94a3b8', fontWeight: 600 }}>{label}</span>
    </div>
  );

  /* ─── Camera / Upload area (shared for front & back) ──────────────── */
  const captureArea = () => (
    <div>
      {!currentCapture ? (
        <>
          {mode === 'camera' ? (
            <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 8, overflow: 'hidden' }}>
              <video autoPlay playsInline ref={videoRef} style={{ width: '100%', display: 'block' }} />
              <div
                style={{
                  position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%',
                  border: '2px dashed rgba(16,185,129,0.8)', borderRadius: 8, pointerEvents: 'none',
                }}
              />
              {/* Overlay label */}
              <div
                style={{
                  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)', color: '#6ee7b7', padding: '4px 14px',
                  borderRadius: 20, fontSize: 11, fontWeight: 700, pointerEvents: 'none',
                }}
              >
                {step === 'front' ? 'NID এর সামনের দিক' : 'NID এর পিছনের দিক'}
              </div>
            </div>
          ) : (
            <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: 30, textAlign: 'center', borderRadius: 8 }}>
              <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  background: '#0284c7', color: 'white', border: 'none',
                  padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                }}
              >
                ফাইল আপলোড করুন ({step === 'front' ? 'সামনের দিক' : 'পিছনের দিক'})
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {mode === 'camera' && (
              <button
                onClick={handleCapture}
                style={{
                  flex: 1, background: '#10b981', color: 'white', border: 'none',
                  padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                ছবি তুলুন
              </button>
            )}
            <button
              onClick={() => {
                if (mode === 'camera') { stopCamera(); setMode('upload'); }
                else { setMode('camera'); startCamera(); }
              }}
              style={{
                background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                padding: '12px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              {mode === 'camera' ? 'ফাইল আপলোড' : 'ক্যামেরা চালু করুন'}
            </button>
          </div>
        </>
      ) : (
        /* Preview captured image before confirming */
        <>
          <div style={{ textAlign: 'center', background: '#000', borderRadius: 8, padding: 8 }}>
            <img
              src={currentCapture}
              alt={step === 'front' ? 'NID Front' : 'NID Back'}
              style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: 4 }}
            />
            <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 6, fontWeight: 600 }}>
              {step === 'front' ? 'NID সামনের দিক' : 'NID পিছনের দিক'} — প্রিভিউ
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={retakeCurrent}
              disabled={isProcessing}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                padding: '12px', borderRadius: 8, cursor: 'pointer', opacity: isProcessing ? 0.5 : 1,
              }}
            >
              পুনরায় তুলুন
            </button>
            <button
              onClick={confirmCapture}
              disabled={isProcessing}
              style={{
                flex: 2, background: '#10b981', color: 'white', border: 'none',
                padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              {step === 'front' ? '✓ সামনের দিক নিশ্চিত করুন' : '✓ পিছনের দিক নিশ্চিত করুন'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  /* ─── Review step: show both images + process button ──────────────── */
  const reviewArea = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Front thumbnail */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600, marginBottom: 6 }}>NID সামনের দিক (Front)</div>
          <div
            style={{
              background: '#000', borderRadius: 8, padding: 6, cursor: 'pointer',
              border: '2px solid rgba(16,185,129,0.4)', position: 'relative',
            }}
            onClick={goBackToFront}
          >
            <img src={frontImage} alt="Front" style={{ width: '100%', borderRadius: 4, display: 'block' }} />
            <div
              style={{
                position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)',
                color: '#f87171', borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              }}
            >
              ↺
            </div>
          </div>
        </div>
        {/* Back thumbnail */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600, marginBottom: 6 }}>NID পিছনের দিক (Back)</div>
          <div
            style={{
              background: '#000', borderRadius: 8, padding: 6, cursor: 'pointer',
              border: '2px solid rgba(16,185,129,0.4)', position: 'relative',
            }}
            onClick={goBackToBack}
          >
            <img src={backImage} alt="Back" style={{ width: '100%', borderRadius: 4, display: 'block' }} />
            <div
              style={{
                position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)',
                color: '#f87171', borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              }}
            >
              ↺
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textAlign: 'center' }}>
        উভয় দিক সফলভাবে ক্যাপচার হয়েছে। "স্ক্যান ও অটো-ফিল করুন" ক্লিক করুন।
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={resetAll}
          disabled={isProcessing}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
            padding: '12px', borderRadius: 8, cursor: 'pointer', opacity: isProcessing ? 0.5 : 1,
          }}
        >
          বাতিল
        </button>
        <button
          onClick={processBothImages}
          disabled={isProcessing}
          style={{
            flex: 2, background: '#10b981', color: 'white', border: 'none',
            padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
            opacity: isProcessing ? 0.5 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          }}
        >
          {isProcessing ? (
            <>
              <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
              OCR প্রসেসিং হচ্ছে (সামনে + পিছনে)...
            </>
          ) : (
            <>🔍 স্ক্যান ও অটো-ফিল করুন</>
          )}
        </button>
      </div>
    </div>
  );

  /* ─── Main render ─────────────────────────────────────────────────── */
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: 'white' }}>NID কার্ড স্ক্যান (OCR)</h3>
        <button
          onClick={resetAll}
          style={{
            background: 'transparent', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: 20, padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 14, justifyContent: 'center' }}>
        {stepIndicator(1, 'সামনের দিক (Front)', !!frontImage)}
        <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
        {stepIndicator(2, 'পিছনের দিক (Back)', !!backImage)}
        <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
        {stepIndicator(3, 'OCR প্রসেসিং', step === 'review' && !!frontImage && !!backImage)}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
            padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Content based on step */}
      {step === 'review' ? reviewArea() : captureArea()}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}