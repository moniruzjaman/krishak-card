/**
 * Image Preprocessing Pipeline for NID OCR
 * Features: Auto NID detection, perspective correction, CLAHE, adaptive thresholding,
 * noise removal, sharpening, text region detection
 */

export class ImagePreprocessor {
  constructor() {
    this.NID_ASPECT_RATIO = 1.586; // 85.6mm / 54mm
    this.NID_RATIO_TOLERANCE = 0.3;
    this.MIN_CONTOUR_AREA_RATIO = 0.05;
  }

  /**
   * Main preprocessing pipeline - executes all steps sequentially
   * @param {HTMLImageElement|HTMLCanvasElement|string} imageSource - Input image
   * @returns {Promise<Object>} Processed image, text regions, and quality score
   */
  async preprocess(imageSource) {
    const src = await this.loadImage(imageSource);

    try {
      // Step 1: Auto-detect and crop NID boundaries
      const cropped = await this.autoDetectNID(src);

      // Step 2: Perspective correction
      const deskewed = await this.perspectiveCorrection(cropped);

      // Step 3: Contrast enhancement (CLAHE)
      const enhanced = await this.contrastEnhancement(deskewed);

      // Step 4: Adaptive thresholding optimized for Bangla script
      const binarized = await this.adaptiveThresholding(enhanced);

      // Step 5: Noise removal
      const denoised = await this.noiseRemoval(binarized);

      // Step 6: Sharpening
      const sharpened = await this.sharpening(denoised);

      // Step 7: Text region detection
      const textRegions = await this.detectTextRegions(sharpened);

      // Calculate quality metrics
      const qualityScore = this.calculateQualityScore(src, sharpened);

      return {
        processedImage: this.matToBlob(sharpened),
        textRegions: textRegions,
        qualityScore: qualityScore,
        dimensions: { width: sharpened.cols, height: sharpened.rows }
      };
    } finally {
      // Cleanup OpenCV Mats
      src.delete();
    }
  }

  /**
   * Step 1: Automatic NID Card Detection
   * Uses contour analysis to find rectangular card boundaries
   */
  async autoDetectNID(src) {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150);

    // Dilate to connect edge fragments
    const dilated = new cv.Mat();
    const dilateKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
    cv.dilate(edges, dilated, dilateKernel);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let bestRect = null;
    let maxArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const imageArea = src.rows * src.cols;

      // Filter by minimum area
      if (area < imageArea * this.MIN_CONTOUR_AREA_RATIO) continue;

      const peri = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * peri, true);

      // Look for quadrilateral shapes
      if (approx.rows >= 4 && approx.rows <= 6) {
        const rect = cv.boundingRect(approx);
        const ratio = rect.width / rect.height;

        // Check aspect ratio matches NID card
        const ratioDiff = Math.abs(ratio - this.NID_ASPECT_RATIO);

        if (ratioDiff < this.NID_RATIO_TOLERANCE && area > maxArea) {
          maxArea = area;
          bestRect = rect;
        }
      }
      approx.delete();
    }

    let result;
    if (bestRect) {
      // Add padding for safety
      const padding = 10;
      const paddedRect = new cv.Rect(
        Math.max(0, bestRect.x - padding),
        Math.max(0, bestRect.y - padding),
        Math.min(src.cols - bestRect.x + padding, bestRect.width + padding * 2),
        Math.min(src.rows - bestRect.y + padding, bestRect.height + padding * 2)
      );
      result = src.roi(paddedRect);
    } else {
      // Fallback: return original with slight resize for consistency
      result = new cv.Mat();
      cv.resize(src, result, new cv.Size(src.cols, src.rows));
    }

    // Cleanup
    gray.delete();
    blurred.delete();
    edges.delete();
    dilated.delete();
    dilateKernel.delete();
    contours.delete();
    hierarchy.delete();

    return result;
  }

  /**
   * Step 2: Perspective Correction / Deskewing
   * Corrects angled captures using Hough line detection
   */
  async perspectiveCorrection(src) {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 150, 3);

    const lines = new cv.Mat();
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);

    let angle = 0;
    let count = 0;

    for (let i = 0; i < lines.rows; i++) {
      const [x1, y1, x2, y2] = [
        lines.data32S[i * 4],
        lines.data32S[i * 4 + 1],
        lines.data32S[i * 4 + 2],
        lines.data32S[i * 4 + 3]
      ];

      const currentAngle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

      // Only consider near-horizontal lines for deskewing
      if (Math.abs(currentAngle) < 30) {
        angle += currentAngle;
        count++;
      }
    }

    lines.delete();
    edges.delete();
    gray.delete();

    if (count > 0) {
      angle /= count;

      // Skip correction if angle is negligible
      if (Math.abs(angle) < 0.5) {
        return src.clone();
      }

      const center = new cv.Point(src.cols / 2, src.rows / 2);
      const rotMat = cv.getRotationMatrix2D(center, angle, 1.0);

      // Calculate new bounding dimensions
      const cos = Math.abs(rotMat.data64F[0]);
      const sin = Math.abs(rotMat.data64F[1]);
      const newWidth = Math.round(src.rows * sin + src.cols * cos);
      const newHeight = Math.round(src.rows * cos + src.cols * sin);

      // Adjust rotation matrix for centering
      rotMat.data64F[2] += (newWidth / 2) - center.x;
      rotMat.data64F[5] += (newHeight / 2) - center.y;

      const rotated = new cv.Mat();
      cv.warpAffine(src, rotated, rotMat, new cv.Size(newWidth, newHeight), 
                    cv.INTER_CUBIC, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));

      rotMat.delete();
      return rotated;
    }

    return src.clone();
  }

  /**
   * Step 3: CLAHE-based Contrast Enhancement
   * Adaptive histogram equalization for faded documents
   */
  async contrastEnhancement(src) {
    const lab = new cv.Mat();
    cv.cvtColor(src, lab, cv.COLOR_RGBA2LAB);

    const planes = new cv.MatVector();
    cv.split(lab, planes);
    const lChannel = planes.get(0);

    // CLAHE: Clip Limit 2.0, Grid Size 8x8
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    const enhanced = new cv.Mat();
    clahe.apply(lChannel, enhanced);

    // Merge back
    planes.set(0, enhanced);
    const result = new cv.Mat();
    cv.merge(planes, result);
    cv.cvtColor(result, result, cv.COLOR_LAB2RGBA);

    // Cleanup
    lab.delete();
    planes.delete();
    lChannel.delete();
    enhanced.delete();
    clahe.delete();

    return result;
  }

  /**
   * Step 4: Adaptive Thresholding for Bangla Script
   * Gaussian adaptive threshold optimized for Bangla conjuncts
   */
  async adaptiveThresholding(src) {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const binary = new cv.Mat();
    // Gaussian adaptive threshold with smaller block for Bangla's fine details
    cv.adaptiveThreshold(
      gray, binary, 255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY, 11, 2
    );

    gray.delete();
    return binary;
  }

  /**
   * Step 5: Noise Removal
   * Morphological opening/closing with elliptical kernel
   */
  async noiseRemoval(src) {
    const denoised = new cv.Mat();
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2));

    // Opening removes small noise dots
    cv.morphologyEx(src, denoised, cv.MORPH_OPEN, kernel);

    // Closing fills small holes in characters
    cv.morphologyEx(denoised, denoised, cv.MORPH_CLOSE, kernel);

    kernel.delete();
    return denoised;
  }

  /**
   * Step 6: Unsharp Masking Sharpening
   * Edge enhancement for degraded print quality
   */
  async sharpening(src) {
    const blurred = new cv.Mat();
    cv.GaussianBlur(src, blurred, new cv.Size(0, 0), 3);

    const sharpened = new cv.Mat();
    // Unsharp mask: original * 1.5 - blurred * 0.5
    cv.addWeighted(src, 1.5, blurred, -0.5, 0, sharpened);

    blurred.delete();
    return sharpened;
  }

  /**
   * Step 7: Text Region Detection using MSER
   * Isolates text blocks from background patterns
   */
  async detectTextRegions(src) {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const mser = new cv.MSER();
    const regions = new cv.MatVector();
    const bboxes = new cv.Mat();

    mser.detectRegions(gray, regions, bboxes);

    const textBoxes = [];
    const imageArea = src.rows * src.cols;

    for (let i = 0; i < bboxes.rows; i++) {
      const [x, y, w, h] = [
        bboxes.data32S[i * 4],
        bboxes.data32S[i * 4 + 1],
        bboxes.data32S[i * 4 + 2],
        bboxes.data32S[i * 4 + 3]
      ];

      const aspectRatio = w / h;
      const area = w * h;

      // Filter criteria for text regions
      const isTextLine = aspectRatio > 1.5 && aspectRatio < 20 && h > 8 && h < 80;
      const isReasonableSize = area > imageArea * 0.001 && area < imageArea * 0.3;

      if (isTextLine && isReasonableSize) {
        textBoxes.push({ 
          x, y, w, h, 
          type: 'text_line',
          aspectRatio,
          confidence: this.estimateTextConfidence(src, x, y, w, h)
        });
      }
    }

    // Merge overlapping regions
    const merged = this.mergeOverlappingRegions(textBoxes);

    gray.delete();
    regions.delete();
    bboxes.delete();
    mser.delete();

    return merged;
  }

  /**
   * Merge overlapping text regions
   */
  mergeOverlappingRegions(regions) {
    if (regions.length === 0) return regions;

    // Sort by y-coordinate
    regions.sort((a, b) => a.y - b.y);

    const merged = [regions[0]];

    for (let i = 1; i < regions.length; i++) {
      const last = merged[merged.length - 1];
      const current = regions[i];

      // Check vertical overlap (same text line)
      const verticalOverlap = Math.min(last.y + last.h, current.y + current.h) - Math.max(last.y, current.y);
      const horizontalGap = current.x - (last.x + last.w);

      if (verticalOverlap > last.h * 0.5 && horizontalGap < last.w * 0.5) {
        // Merge regions
        const newX = Math.min(last.x, current.x);
        const newY = Math.min(last.y, current.y);
        const newW = Math.max(last.x + last.w, current.x + current.w) - newX;
        const newH = Math.max(last.y + last.h, current.y + current.h) - newY;

        merged[merged.length - 1] = {
          x: newX, y: newY, w: newW, h: newH,
          type: 'text_line',
          confidence: Math.max(last.confidence, current.confidence)
        };
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Estimate text confidence based on region characteristics
   */
  estimateTextConfidence(src, x, y, w, h) {
    const roi = src.roi(new cv.Rect(x, y, w, h));
    const gray = new cv.Mat();
    cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);

    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(gray, mean, stddev);

    const variance = stddev.data64F[0] ** 2;
    const confidence = Math.min(1, variance / 500);

    roi.delete();
    gray.delete();
    mean.delete();
    stddev.delete();

    return confidence;
  }

  /**
   * Calculate overall image quality score
   */
  calculateQualityScore(original, processed) {
    const laplacian = new cv.Mat();
    cv.Laplacian(processed, laplacian, cv.CV_64F);

    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(laplacian, mean, stddev);

    const variance = stddev.data64F[0] ** 2;
    const sharpnessScore = Math.min(100, variance / 10);

    laplacian.delete();
    mean.delete();
    stddev.delete();

    return {
      sharpness: Math.round(sharpnessScore),
      overall: sharpnessScore > 50 ? 'good' : sharpnessScore > 30 ? 'acceptable' : 'poor'
    };
  }

  /**
   * Load image from various sources
   */
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      if (source instanceof HTMLCanvasElement) {
        resolve(cv.imread(source));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(cv.imread(canvas));
      };
      img.onerror = reject;

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File || source instanceof Blob) {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  /**
   * Convert OpenCV Mat to Blob for OCR processing
   */
  matToBlob(mat) {
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, mat);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }
}

export default ImagePreprocessor;
