// True perspective correction with zero runtime dependencies — no OpenCV,
// no CDN fetch, no WASM. This is the "offline-first" answer: a 4-point
// homography solved by hand (Direct Linear Transform) and applied via
// inverse-mapped bilinear sampling on a plain <canvas>. Ships in the app's
// own JS bundle, so it works the first time the PWA loads and every time
// after with zero network dependency — unlike a CDN-hosted opencv.js.
//
// Math: for 4 point correspondences we solve the 8-unknown linear system
// (h33 fixed to 1) that defines the projective mapping. We solve directly
// for the INVERSE mapping (output-rectangle -> source-quad) so warping is a
// single pass with no separate matrix inversion step.

/** Solve A*x = b via Gaussian elimination with partial pivoting. A is NxN, b is length N. */
function solveLinearSystem(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null; // singular / degenerate quad
    [M[col], M[pivot]] = [M[pivot], M[col]];

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }

  return M.map((row, i) => row[n] / row[i]);
}

/** Homography H (3x3, row-major, h[8]=1) mapping fromPts -> toPts, each a 4-point array of {x,y}. */
export function computeHomography(fromPts, toPts) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = fromPts[i];
    const { x: xp, y: yp } = toPts[i];
    A.push([x, y, 1, 0, 0, 0, -x * xp, -y * xp]);
    b.push(xp);
    A.push([0, 0, 0, x, y, 1, -x * yp, -y * yp]);
    b.push(yp);
  }
  const h = solveLinearSystem(A, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function bilinearSample(data, w, h, sx, sy) {
  const x0 = Math.floor(sx), y0 = Math.floor(sy);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const cx = Math.max(0, Math.min(w - 1, x0));
  const cy = Math.max(0, Math.min(h - 1, y0));
  if (sx < 0 || sy < 0 || sx > w - 1 || sy > h - 1) {
    // outside source bounds — return background white rather than garbage/black
    return [255, 255, 255, 255];
  }
  const fx = sx - x0, fy = sy - y0;
  const idx = (xx, yy) => ((yy * w + xx) * 4);
  const out = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    const p00 = data[idx(cx, cy) + c];
    const p10 = data[idx(Math.min(w - 1, x1), cy) + c];
    const p01 = data[idx(cx, Math.min(h - 1, y1)) + c];
    const p11 = data[idx(Math.min(w - 1, x1), Math.min(h - 1, y1)) + c];
    out[c] = p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) + p01 * (1 - fx) * fy + p11 * fx * fy;
  }
  return out;
}

/**
 * Warp the quadrilateral region of `imgEl` (an already-loaded <img>) to a
 * flat outW x outH canvas, correcting perspective/skew from an angled
 * capture. `quad` is 4 {x,y} points in source-image pixel coordinates,
 * ordered [top-left, top-right, bottom-right, bottom-left].
 */
export function perspectiveWarp(imgEl, quad, outW, outH) {
  const srcCanvas = document.createElement('canvas');
  const sw = imgEl.naturalWidth || imgEl.width;
  const sh = imgEl.naturalHeight || imgEl.height;
  srcCanvas.width = sw;
  srcCanvas.height = sh;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(imgEl, 0, 0, sw, sh);
  const srcData = srcCtx.getImageData(0, 0, sw, sh).data;

  const rect = [
    { x: 0, y: 0 }, { x: outW, y: 0 }, { x: outW, y: outH }, { x: 0, y: outH },
  ];
  // H maps output-rectangle coords directly to source-quad coords — this is
  // the inverse mapping we need for sampling, computed directly (no matrix
  // inversion required) by just swapping which point set is "from" vs "to".
  const H = computeHomography(rect, quad);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d');
  const outImageData = outCtx.createImageData(outW, outH);
  const outData = outImageData.data;

  if (!H) {
    // Degenerate quad (shouldn't normally happen — 4 dragged corners are
    // always non-collinear in practice) — fall back to a plain scaled draw.
    outCtx.drawImage(imgEl, 0, 0, outW, outH);
    return outCanvas;
  }

  for (let dy = 0; dy < outH; dy++) {
    for (let dx = 0; dx < outW; dx++) {
      const w = H[6] * dx + H[7] * dy + 1;
      const sx = (H[0] * dx + H[1] * dy + H[2]) / w;
      const sy = (H[3] * dx + H[4] * dy + H[5]) / w;
      const [r, g, bch, a] = bilinearSample(srcData, sw, sh, sx, sy);
      const o = (dy * outW + dx) * 4;
      outData[o] = r; outData[o + 1] = g; outData[o + 2] = bch; outData[o + 3] = a;
    }
  }

  outCtx.putImageData(outImageData, 0, 0);
  return outCanvas;
}
