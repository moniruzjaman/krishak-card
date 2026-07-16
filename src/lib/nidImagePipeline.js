// Core image-processing pipeline for NID capture, built on OpenCV.js.
// Pipeline order (matters — see plans/ocr-pipeline-v2-plan.md Phase 1):
//   crop (manual or auto quad) -> perspective correction -> grayscale
//   -> denoise -> CLAHE contrast -> unsharp-mask sharpen -> (optional) adaptive threshold
// Denoise/sharpen run on grayscale BEFORE any binarization, since sharpening
// or denoising a already-binarized image does nothing useful. We feed
// Tesseract the enhanced grayscale image rather than a hard-thresholded one —
// aggressive binarization tends to erase thin Bangla matras/juktakkhor
// strokes on faded cards, which hurt accuracy more than they help.

import { CARD_OUT_WIDTH, CARD_OUT_HEIGHT } from './nidCardGeometry';
export { CARD_OUT_WIDTH, CARD_OUT_HEIGHT };

/** Load an <img> or dataURL into a cv.Mat (RGBA). */
export function imageToMat(cv, imgEl) {
  return cv.imread(imgEl);
}

/** Order 4 arbitrary points as [top-left, top-right, bottom-right, bottom-left]. */
export function orderPoints(pts) {
  const sum = pts.map((p) => p.x + p.y);
  const diff = pts.map((p) => p.x - p.y);
  const tl = pts[sum.indexOf(Math.min(...sum))];
  const br = pts[sum.indexOf(Math.max(...sum))];
  const tr = pts[diff.indexOf(Math.max(...diff))];
  const bl = pts[diff.indexOf(Math.min(...diff))];
  return [tl, tr, br, bl];
}

/**
 * Try to auto-detect the NID card's rectangular boundary in the raw frame.
 * Returns an ordered 4-point quad in image pixel coordinates, or null if no
 * confident card-shaped contour is found (caller should fall back to a
 * manual default inset rectangle for the user to drag into place).
 */
export function detectCardQuad(cv, srcMat) {
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edged = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  let result = null;

  try {
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edged, 50, 150);
    cv.dilate(edged, edged, cv.Mat.ones(3, 3, cv.CV_8U));
    cv.findContours(edged, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    const imgArea = srcMat.rows * srcMat.cols;
    let best = null;
    let bestArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const c = contours.get(i);
      const area = cv.contourArea(c);
      // A real card should fill a meaningful chunk of the frame but not the whole thing
      if (area < imgArea * 0.15 || area > imgArea * 0.95) { c.delete(); continue; }

      const peri = cv.arcLength(c, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(c, approx, 0.02 * peri, true);

      if (approx.rows === 4 && area > bestArea) {
        bestArea = area;
        if (best) best.delete();
        best = approx;
      } else {
        approx.delete();
      }
      c.delete();
    }

    if (best) {
      const pts = [];
      for (let i = 0; i < 4; i++) {
        pts.push({ x: best.data32S[i * 2], y: best.data32S[i * 2 + 1] });
      }
      best.delete();
      result = orderPoints(pts);
    }
  } finally {
    gray.delete(); blurred.delete(); edged.delete(); contours.delete(); hierarchy.delete();
  }

  return result;
}

/** Perspective-warp the quad region of srcMat to a flat, standard-size card image. */
export function warpToCard(cv, srcMat, quad, outW = CARD_OUT_WIDTH, outH = CARD_OUT_HEIGHT) {
  const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, quad.flatMap((p) => [p.x, p.y]));
  const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outW, 0, outW, outH, 0, outH]);
  const M = cv.getPerspectiveTransform(srcTri, dstTri);
  const dst = new cv.Mat();
  try {
    cv.warpPerspective(srcMat, dst, M, new cv.Size(outW, outH));
  } finally {
    srcTri.delete(); dstTri.delete(); M.delete();
  }
  return dst;
}

/**
 * Full OCR-oriented enhancement: grayscale -> despeckle -> adaptive contrast
 * (CLAHE) -> unsharp-mask sharpen. Returns a new single-channel cv.Mat.
 * The `binarize` flag additionally produces a bitonal copy (used only for
 * text-region masking, not fed to Tesseract directly — see rationale above).
 */
export function enhanceForOcr(cv, cardMat, { binarize = false } = {}) {
  const gray = new cv.Mat();
  const denoised = new cv.Mat();
  const clahed = new cv.Mat();
  const blurredForSharpen = new cv.Mat();
  const sharpened = new cv.Mat();

  cv.cvtColor(cardMat, gray, cv.COLOR_RGBA2GRAY);

  // Noise Removal — despeckle low-quality phone-camera captures
  cv.fastNlMeansDenoising(gray, denoised, 7, 7, 21);

  // Contrast Enhancement — adaptive histogram equalization for faded ink
  const clahe = new cv.CLAHE(2.5, new cv.Size(8, 8));
  clahe.apply(denoised, clahed);
  clahe.delete();

  // Sharpening — unsharp mask (amount 1.5) for degraded/soft print quality
  cv.GaussianBlur(clahed, blurredForSharpen, new cv.Size(0, 0), 3);
  cv.addWeighted(clahed, 1.5, blurredForSharpen, -0.5, 0, sharpened);

  let binary = null;
  if (binarize) {
    binary = new cv.Mat();
    // Adaptive Thresholding — tuned for Bangla script (small block, gaussian weighting
    // handles uneven lighting across a card better than a single Otsu global threshold)
    cv.adaptiveThreshold(
      sharpened, binary, 255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 10
    );
  }

  gray.delete(); denoised.delete(); clahed.delete(); blurredForSharpen.delete();

  return { enhanced: sharpened, binary };
}

export function matToDataUrl(cv, mat) {
  const canvas = document.createElement("canvas");
  canvas.width = mat.cols;
  canvas.height = mat.rows;
  cv.imshow(canvas, mat);
  return canvas.toDataURL("image/png");
}

/** Convenience: run the full pipeline from a raw captured image element/dataURL source to Tesseract-ready dataURL. */
export function runFullPipeline(cv, imgEl, quad) {
  const src = imageToMat(cv, imgEl);
  let card, enhanced;
  try {
    card = quad ? warpToCard(cv, src, quad) : src.clone();
    const { enhanced: enh, binary } = enhanceForOcr(cv, card);
    enhanced = enh;
    if (binary) binary.delete();
    return matToDataUrl(cv, enhanced);
  } finally {
    src.delete();
    if (card) card.delete();
    if (enhanced) enhanced.delete();
  }
}
