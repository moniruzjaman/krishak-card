import { useState, useRef, useEffect } from 'react';

export default function NidOcrCapture({ onDataExtracted }) {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'
  const [stream, setStream] = useState(null);
  const [imageCaptured, setImageCaptured] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when closing
  useEffect(() => {
    return () => {
      stopCamera();
    };
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

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImageCaptured(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageCaptured(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImageCaptured(null);
    setError(null);
    if (mode === 'camera') startCamera();
  };

  const processImage = async () => {
    if (!imageCaptured) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation: Send FormData with blob
      // For this mock, we just trigger the endpoint
      const response = await fetch('/api/nid-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageCaptured }) // sending base64
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        onDataExtracted(result.data);
        setIsActive(false);
        setImageCaptured(null);
      } else {
        throw new Error(result.message || 'Processing failed');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('তথ্য স্ক্যান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা ম্যানুয়ালি পূরণ করুন।');
    } finally {
      setIsProcessing(false);
    }
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
          onClick={() => { setIsActive(false); stopCamera(); setImageCaptured(null); }}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, padding: 0 }}
        >×</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {!imageCaptured ? (
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
      ) : (
        <>
          <div style={{ textAlign: 'center', background: '#000', borderRadius: 8, padding: 8 }}>
             <img src={imageCaptured} alt="Captured NID" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 4 }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button 
              onClick={retake}
              disabled={isProcessing}
              style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}
            >পুনরায়</button>
            <button 
              onClick={processImage}
              disabled={isProcessing}
              style={{ flex: 2, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {isProcessing ? 'প্রসেসিং হচ্ছে...' : 'স্ক্যান নিশ্চিত করুন'}
            </button>
          </div>
        </>
      )}
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
