import { useState, useRef, useEffect, useCallback } from 'react';
import { loadOpenCv } from '../lib/cvLoader';
import { imageToMat, detectCardQuad } from '../lib/nidImagePipeline';
import { runFallbackPipeline } from '../lib/canvasFallback';
import { correctAndScoreName } from '../lib/banglaTextCorrection';
import { scoreOcrFields } from '../lib/ocrConfidence';

// Default crop rectangle before auto-detection resolves (or if it fails):
// an inset box roughly matching NID card proportions, expressed as fractions
// of the image (0..1) so it's independent of actual image resolution.
const DEFAULT_QUAD_FRAC = [
  { x: 0.08, y: 0.15 }, // top-left
  { x: 0.92, y: 0.15 }, // top-right
  { x: 0.92, y: 0.85 }, // bottom-right
  { x: 0.08, y: 0.85 }, // bottom-left
];

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Draggable 4-corner crop overlay, rendered over the raw captured image. */
function CropOverlay({ quadFrac, onChange, containerRef }) {
  const dragIndex = useRef(null);

  const toFrac = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return { x, y };
  }, [containerRef]);

  const onPointerDown = (i) => (e) => {
    e.preventDefault();
    dragIndex.current = i;
    e.target.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (dragIndex.current === null) return;
    const next = quadFrac.slice();
    next[dragIndex.current] = toFrac(e.clientX, e.clientY);
    onChange(next);
  };

  const onPointerUp = () => { dragIndex.current = null; };

  const polygonPoints = quadFrac.map((p) => `${p.x * 100},${p.y * 100}`).join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <polygon
        points={polygonPoints}
        fill="rgba(16,185,129,0.15)"
        stroke="#10b981"
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
      />
      {quadFrac.map((p, i) => (
        <circle
          key={i}
          cx={p.x * 100}
          cy={p.y * 100}
          r={2.2}
          fill="#10b981"
          stroke="white"
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
          style={{ cursor: 'grab', pointerEvents: 'all' }}
          onPointerDown={onPointerDown(i)}
        />
      ))}
    </svg>
  );
}

export default function NidOcrCapture({ onDataExtracted }) {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'
  const [stream, setStream] = useState(null);
  const [stage, setStage] = useState('capture'); // 'capture' | 'crop' | 'processing'
  const [imageCaptured, setImageCaptured] = useState(null);
  const [quadFrac, setQuadFrac] = useState(DEFAULT_QUAD_FRAC);
  const [userAdjustedQuad, setUserAdjustedQuad] = useState(false);
  const [autoDetectStatus, setAutoDetectStatus] = useState(null); // null | 'detecting' | 'found' | 'not_found' | 'unavailable'
  const [processedPreview, setProcessedPreview] = useState(null);
  const [processingLabel, setProcessingLabel] = useState('');
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cropContainerRef = useRef(null);

  useEffect(() => {
    return () => { stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('ক্যামেরা চালু করা যাচ্ছে না। দয়া করে ফাইল আপলোড ব্যবহার করুন।');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Both the camera-capture path and the file-upload path funnel into this,
  // so preprocessing/crop applies identically regardless of image source.
  const onRawImageReady = (dataUrl) => {
    setImageCaptured(dataUrl);
    setQuadFrac(DEFAULT_QUAD_FRAC);
    setUserAdjustedQuad(false);
    setError(null);
    setStage('crop');
    attemptAutoDetect(dataUrl);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onRawImageReady(dataUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => onRawImageReady(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Automatic NID Detection — try to find the card's rectangular boundary via
  // OpenCV contour detection so the officer usually doesn't need to drag
  // corners at all. Silently falls back to the default inset box on failure.
  const attemptAutoDetect = async (dataUrl) => {
    setAutoDetectStatus('detecting');
    try {
      const cv = await loadOpenCv();
      const imgEl = await loadImageElement(dataUrl);
      const mat = imageToMat(cv, imgEl);
      let quad = null;
      try {
        quad = detectCardQuad(cv, mat);
      } finally {
        mat.delete();
      }
      if (quad) {
        const w = imgEl.naturalWidth, h = imgEl.naturalHeight;
        setQuadFrac(quad.map((p) => ({ x: p.x / w, y: p.y / h })));
        setAutoDetectStatus('found');
      } else {
        setAutoDetectStatus('not_found');
      }
    } catch (err) {
      console.warn('OpenCV unavailable, using manual crop only:', err);
      setAutoDetectStatus('unavailable');
    }
  };

  const retakeFromCrop = () => {
    stopCamera();
    setImageCaptured(null);
    setProcessedPreview(null);
    setError(null);
    setStage('capture');
    if (mode === 'camera') startCamera();
  };

  const resetQuad = () => {
    setQuadFrac(DEFAULT_QUAD_FRAC);
    setUserAdjustedQuad(false);
  };

  // Image Preprocessing Enhancement pipeline (crop -> perspective correction ->
  // contrast -> despeckle -> sharpen), then OCR. Runs the pure-JS offline
  // pipeline (perspectiveTransform.js + canvasFallback.js) directly — no
  // OpenCV/WASM/CDN dependency for this step at all, so it works fully
  // offline every time, not just when a network happens to be available.
  const cropAndProcess = async () => {
    if (!imageCaptured) return;
    setStage('processing');
    setError(null);
    setProcessingLabel('ছবি প্রসেস করা হচ্ছে...');

    try {
      const imgEl = await loadImageElement(imageCaptured);
      const w = imgEl.naturalWidth, h = imgEl.naturalHeight;
      const quadPx = quadFrac.map((p) => ({ x: p.x * w, y: p.y * h }));

      const enhancedDataUrl = runFallbackPipeline(imgEl, quadPx);

      setProcessedPreview(enhancedDataUrl);
      setProcessingLabel('লেখা শনাক্ত করা হচ্ছে (OCR)...');
      await runOcrAndFill(enhancedDataUrl);
    } catch (err) {
      console.error('Preprocessing error:', err);
      setError('ছবি প্রসেস করতে সমস্যা হয়েছে। ক্রপ ঠিক করে আবার চেষ্টা করুন।');
      setStage('crop');
    }
  };

  const runOcrAndFill = async (ocrInputDataUrl) => {
    try {
      const Tesseract = (await import('tesseract.js')).default;

      // 1. Client-side OCR on the preprocessed (cropped, deskewed, contrast-
      // enhanced) image rather than the raw capture. `data.words` gives us
      // per-word confidence, which the confidence-scoring layer below needs.
      const { data } = await Tesseract.recognize(
        ocrInputDataUrl,
        'ben+eng',
      );
      const text = data.text;
      const ocrWords = (data.words || []).map((w) => ({ text: w.text, confidence: w.confidence }));

      setProcessingLabel('তথ্য যাচাই করা হচ্ছে...');

      // 2. Pass OCR text to AI for structured parsing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are an AI that extracts variables from messy Bangladeshi NID card OCR text.
Extract these exactly as JSON (leave null if missing):
- name (Bangla name)
- dob (YYYY-MM-DD or parseable dob)
- nid (10, 13, or 17 digit ID)
- address (object with: division, district, upazila, village, municipality, postOffice)
Return ONLY raw JSON, no markdown formatting.`,
          messages: [{ role: 'user', content: text }]
        })
      });

      if (!response.ok) throw new Error('AI parsing failed');
      const { text: jsonStr } = await response.json();
      const parsed = JSON.parse(jsonStr);

      if (parsed) {
        // 3. Bangla Language Correction Layer — repair conjunct/matra
        // fragmentation and fuzzy-match against the common-name dictionary.
        const { corrected: correctedName, confidence: nameDictConfidence } = correctAndScoreName(parsed.name);
        parsed.name = correctedName || parsed.name;

        // 4. OCR Confidence-Based scoring — blend Tesseract per-word confidence
        // with how well each parsed value actually matches the raw OCR text,
        // so a field the LLM guessed with no real OCR support scores low.
        const fieldsForScoring = {
          name: parsed.name,
          dob: parsed.dob,
          nid: parsed.nid,
          division: parsed.address?.division,
          district: parsed.address?.district,
          upazila: parsed.address?.upazila,
          village: parsed.address?.village,
          union: parsed.address?.municipality || parsed.address?.postOffice,
        };
        const confidenceMap = scoreOcrFields(fieldsForScoring, ocrWords);
        // Blend the dictionary-match confidence into the name score too —
        // a name Tesseract read clearly but that matches no known token
        // (or vice versa) should land in yellow/red rather than a silent green.
        if (confidenceMap.name != null) {
          confidenceMap.name = Math.round((confidenceMap.name + nameDictConfidence) / 2);
        } else {
          confidenceMap.name = nameDictConfidence;
        }

        onDataExtracted(parsed, confidenceMap);
        closeScanner();
      } else {
        throw new Error('Processing failed');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('তথ্য স্ক্যান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা ম্যানুয়ালি পূরণ করুন।');
      setStage('crop');
    }
  };

  const closeScanner = () => {
    setIsActive(false);
    setStage('capture');
    setImageCaptured(null);
    setProcessedPreview(null);
    setAutoDetectStatus(null);
  };

  if (!isActive) {
    return (
      <button
        onClick={() => { setIsActive(true); startCamera(); }}
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
          marginBottom: 16
        }}
      >
        <span>📷</span> NID কার্ড স্ক্যান করুন (Auto-fill)
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16,185,129,0.4)',
      borderRadius: 12, padding: 16, marginBottom: 16
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: 'white' }}>NID কার্ড স্ক্যান (OCR)</h3>
        <button
          onClick={closeScanner}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, padding: 0 }}
        >×</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Stage 1: capture / upload ── */}
      {stage === 'capture' && (
        <>
          {mode === 'camera' ? (
            <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 8, overflow: 'hidden' }}>
              <video autoPlay playsInline ref={videoRef} style={{ width: '100%', display: 'block' }}></video>
              <div style={{
                position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%',
                border: '2px dashed rgba(16,185,129,0.8)', borderRadius: 8, pointerEvents: 'none'
              }}></div>
            </div>
          ) : (
            <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: 30, textAlign: 'center', borderRadius: 8 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}
              >
                ফাইল আপলোড করুন
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {mode === 'camera' && (
              <button
                onClick={handleCapture}
                style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
              >ছবি তুলুন</button>
            )}
            <button
              onClick={() => {
                if (mode === 'camera') { stopCamera(); setMode('upload'); }
                else { setMode('camera'); startCamera(); }
              }}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer' }}
            >
              {mode === 'camera' ? 'ফাইল আপলোড' : 'ক্যামেরা চালু করুন'}
            </button>
          </div>
        </>
      )}

      {/* ── Stage 2: adjust crop ── */}
      {stage === 'crop' && imageCaptured && (
        <>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
            {autoDetectStatus === 'detecting' && '🔎 কার্ডের সীমানা শনাক্ত করা হচ্ছে...'}
            {autoDetectStatus === 'found' && '✅ কার্ড স্বয়ংক্রিয়ভাবে শনাক্ত হয়েছে — প্রয়োজনে কোণ টেনে ঠিক করুন'}
            {(autoDetectStatus === 'not_found' || autoDetectStatus === 'unavailable') && '✋ কার্ডের ৪ কোণ টেনে ঠিক জায়গায় বসান'}
          </div>

          <div
            ref={cropContainerRef}
            style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 8, overflow: 'hidden', lineHeight: 0 }}
          >
            <img src={imageCaptured} alt="Captured NID" style={{ width: '100%', display: 'block' }} />
            <CropOverlay
              quadFrac={quadFrac}
              onChange={(q) => { setQuadFrac(q); setUserAdjustedQuad(true); }}
              containerRef={cropContainerRef}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={retakeFromCrop}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer' }}
            >পুনরায় তুলুন</button>
            {userAdjustedQuad && (
              <button
                onClick={resetQuad}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer' }}
              >রিসেট</button>
            )}
            <button
              onClick={cropAndProcess}
              style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
            >কাটুন ও স্ক্যান করুন</button>
          </div>
        </>
      )}

      {/* ── Stage 3: processing ── */}
      {stage === 'processing' && (
        <>
          <div style={{ textAlign: 'center', background: '#000', borderRadius: 8, padding: 8 }}>
            <img
              src={processedPreview || imageCaptured}
              alt="Processed NID"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 4, filter: processedPreview ? 'none' : 'grayscale(1)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, color: '#6ee7b7', fontSize: 13, fontWeight: 600 }}>
            <span style={{ display: 'inline-block' }}>⏳</span>
            {processingLabel || 'প্রসেসিং হচ্ছে...'}
          </div>
        </>
      )}

      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
