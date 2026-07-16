// Fully offline preprocessing pipeline — no OpenCV, no WASM, no CDN fetch.
// This is now the PRIMARY pipeline (not just a degraded fallback): true
// perspective correction comes from perspectiveTransform.js (pure JS
// homography + bilinear sampling), so the app never needs a network round
// trip or a large WASM download just to crop/straighten/clean a scan.
//
// Pipeline order: perspective warp -> grayscale -> median despeckle ->
// tiled adaptive contrast (a lightweight CLAHE-style local equalization,
// so unevenly faded ink across the card gets corrected per-region rather
// than by one global stretch) -> unsharp-mask sharpen.

import { perspectiveWarp } from './perspectiveTransform';
import { CARD_OUT_WIDTH, CARD_OUT_HEIGHT } from './nidCardGeometry';

function toGrayscale(imageData) {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

/** 3x3 median filter — despeckles low-quality phone captures without blurring text edges as much as a Gaussian blur would. */
function medianDenoise(gray, width, height) {
  const out = new Float32Array(gray.length);
  const window = new Array(9);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let k = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const yy = Math.min(height - 1, Math.max(0, y + ky));
          const xx = Math.min(width - 1, Math.max(0, x + kx));
          window[k++] = gray[yy * width + xx];
        }
      }
      window.sort((a, b) => a - b);
      out[y * width + x] = window[4];
    }
  }
  return out;
}

/**
 * Lightweight CLAHE-style adaptive contrast: split the image into a grid of
 * tiles, min/max-stretch each tile independently, then bilinearly blend
 * between tile centers so there are no hard seams at tile borders. This is
 * cheaper than full histogram equalization but still corrects per-region
 * fading (e.g. one corner of a card catching glare while another is dim)
 * far better than a single global stretch.
 */
function tiledAdaptiveContrast(gray, width, height, tilesX = 6, tilesY = 4) {
  const tileW = Math.ceil(width / tilesX);
  const tileH = Math.ceil(height / tilesY);
  const tileMin = [];
  const tileMax = [];

  for (let ty = 0; ty < tilesY; ty++) {
    tileMin.push([]); tileMax.push([]);
    for (let tx = 0; tx < tilesX; tx++) {
      let mn = 255, mx = 0;
      const x0 = tx * tileW, x1 = Math.min(width, x0 + tileW);
      const y0 = ty * tileH, y1 = Math.min(height, y0 + tileH);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const v = gray[y * width + x];
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
      }
      // Clip extreme tiles (e.g. a near-solid photo region) so they don't
      // amplify noise — clamp the stretch range to at least 40 levels.
      if (mx - mn < 40) { const mid = (mx + mn) / 2; mn = mid - 20; mx = mid + 20; }
      tileMin[ty].push(mn);
      tileMax[ty].push(mx);
    }
  }

  const out = new Float32Array(gray.length);
  for (let y = 0; y < height; y++) {
    // Which two tile rows to blend between, and how far between them (0..1)
    const fty = (y - tileH / 2) / tileH;
    const ty0 = Math.min(tilesY - 1, Math.max(0, Math.floor(fty)));
    const ty1 = Math.min(tilesY - 1, ty0 + 1);
    const wy = Math.min(1, Math.max(0, fty - ty0));

    for (let x = 0; x < width; x++) {
      const ftx = (x - tileW / 2) / tileW;
      const tx0 = Math.min(tilesX - 1, Math.max(0, Math.floor(ftx)));
      const tx1 = Math.min(tilesX - 1, tx0 + 1);
      const wx = Math.min(1, Math.max(0, ftx - tx0));

      const mn =
        tileMin[ty0][tx0] * (1 - wx) * (1 - wy) + tileMin[ty0][tx1] * wx * (1 - wy) +
        tileMin[ty1][tx0] * (1 - wx) * wy + tileMin[ty1][tx1] * wx * wy;
      const mx =
        tileMax[ty0][tx0] * (1 - wx) * (1 - wy) + tileMax[ty0][tx1] * wx * (1 - wy) +
        tileMax[ty1][tx0] * (1 - wx) * wy + tileMax[ty1][tx1] * wx * wy;

      const range = Math.max(1, mx - mn);
      const v = gray[y * width + x];
      out[y * width + x] = Math.min(255, Math.max(0, ((v - mn) / range) * 255));
    }
  }
  return out;
}

/** Unsharp mask: subtract a blurred copy from a boosted original to punch up edges softened by print/scan degradation. */
function unsharpMask(gray, width, height, amount = 1.5) {
  // cheap separable box blur as the "blurred copy"
  const blurred = new Float32Array(gray.length);
  const radius = 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0, count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const yy = y + ky;
        if (yy < 0 || yy >= height) continue;
        for (let kx = -radius; kx <= radius; kx++) {
          const xx = x + kx;
          if (xx < 0 || xx >= width) continue;
          sum += gray[yy * width + xx];
          count++;
        }
      }
      blurred[y * width + x] = sum / count;
    }
  }
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    out[i] = Math.min(255, Math.max(0, gray[i] + amount * (gray[i] - blurred[i])));
  }
  return out;
}

function grayToCanvas(gray, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    const v = gray[p];
    data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Full offline pipeline: perspective-correct the dragged quad to a flat
 * standard-size card, then despeckle/contrast/sharpen — all pure JS/canvas,
 * zero network or WASM dependency. Returns a data URL ready for Tesseract.
 */
export function runFallbackPipeline(imgEl, quad, { outW = CARD_OUT_WIDTH, outH = CARD_OUT_HEIGHT } = {}) {
  const warped = quad ? perspectiveWarp(imgEl, quad, outW, outH) : (() => {
    const c = document.createElement('canvas');
    c.width = imgEl.naturalWidth || imgEl.width;
    c.height = imgEl.naturalHeight || imgEl.height;
    c.getContext('2d').drawImage(imgEl, 0, 0);
    return c;
  })();

  const ctx = warped.getContext('2d');
  const imageData = ctx.getImageData(0, 0, warped.width, warped.height);
  let gray = toGrayscale(imageData);
  gray = medianDenoise(gray, warped.width, warped.height);
  gray = tiledAdaptiveContrast(gray, warped.width, warped.height);
  gray = unsharpMask(gray, warped.width, warped.height);

  return grayToCanvas(gray, warped.width, warped.height).toDataURL('image/png');
}
