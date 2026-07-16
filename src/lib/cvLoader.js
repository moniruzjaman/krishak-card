// Lazy loader for OpenCV.js (WASM, ~8MB). Only fetched when the NID scanner
// actually opens, never on initial app load — important for Termux / rural
// low-bandwidth field use. If it fails to load (offline, blocked CDN, slow
// connection timeout), callers should fall back to the pure-canvas pipeline
// in `canvasFallback.js` rather than blocking the whole scan flow.

const CV_URL = "https://docs.opencv.org/4.10.0/opencv.js";
const LOAD_TIMEOUT_MS = 12000;

let cvPromise = null;

export function loadOpenCv() {
  if (cvPromise) return cvPromise;

  cvPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.cv && window.cv.Mat) {
      resolve(window.cv);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("OpenCV.js load timed out"));
    }, LOAD_TIMEOUT_MS);

    const existing = document.querySelector('script[data-opencv-loader="1"]');
    const script = existing || document.createElement("script");

    const onReady = () => {
      // opencv.js calls this once WASM runtime finishes initializing
      window.cv.onRuntimeInitialized = () => {
        clearTimeout(timeout);
        resolve(window.cv);
      };
      // Some builds are already initialized by the time onload fires
      if (window.cv && window.cv.Mat) {
        clearTimeout(timeout);
        resolve(window.cv);
      }
    };

    if (!existing) {
      script.src = CV_URL;
      script.async = true;
      script.dataset.opencvLoader = "1";
      script.onerror = () => {
        clearTimeout(timeout);
        cvPromise = null; // allow retry on next scan attempt
        reject(new Error("Failed to fetch OpenCV.js"));
      };
      script.onload = onReady;
      document.head.appendChild(script);
    } else {
      onReady();
    }
  });

  return cvPromise;
}

export function isOpenCvReady() {
  return !!(typeof window !== "undefined" && window.cv && window.cv.Mat);
}
