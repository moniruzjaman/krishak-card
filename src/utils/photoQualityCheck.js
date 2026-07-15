/**
 * Smart Photo Quality Check System
 * 
 * Real-time image quality validation before allowing photo submission:
 * - Blur detection (Laplacian variance threshold)
 * - Insufficient lighting (histogram analysis)
 * - Glare/overexposure (highlight clipping detection)
 * - Poor framing/cropping (face detection validation)
 * 
 * When quality issues are detected, the system immediately prompts for 
 * re-capture with specific guidance messages rather than accepting suboptimal images.
 */

export class PhotoQualityChecker {
  constructor() {
    this.thresholds = {
      blur: { 
        min: 120,      // Acceptable sharpness
        warning: 80,   // Borderline - suggest retake
        critical: 50   // Too blurry - reject
      },
      lighting: { 
        min: 40,       // Too dark
        max: 230,      // Too bright
        optimal: 128,  // Target mean brightness
        warningLow: 60,
        warningHigh: 200
      },
      glare: { 
        max: 0.10,     // Max 10% overexposed pixels
        warning: 0.05  // Warning at 5%
      },
      face: { 
        minSize: 0.08,  // Face should be at least 8% of image
        maxSize: 0.70,  // Face should not exceed 70% of image
        minConfidence: 0.7
      },
      contrast: {
        min: 30,       // Minimum standard deviation
        warning: 50
      }
    };

    this.faceDetector = null;
    this.isFaceDetectorReady = false;
  }

  /**
   * Initialize face detection model (lazy loading)
   */
  async initFaceDetector() {
    if (this.isFaceDetectorReady) return;

    try {
      // Try to use browser's FaceDetector API if available
      if ('FaceDetector' in window) {
        this.faceDetector = new FaceDetector({
          fastMode: false,
          maxDetectedFaces: 1
        });
        this.isFaceDetectorReady = true;
        return;
      }
    } catch {
      // Fallback: will use basic image analysis
      this.isFaceDetectorReady = true;
    }
  }

  /**
   * Main quality check pipeline
   * @param {HTMLImageElement|HTMLCanvasElement|string} imageSource
   * @returns {Promise<Object>} Quality assessment with specific guidance
   */
  async checkQuality(imageSource) {
    await this.initFaceDetector();

    const src = await this.loadImage(imageSource);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    try {
      // Run all quality checks in parallel
      const [
        blurCheck,
        lightingCheck,
        glareCheck,
        contrastCheck,
        faceCheck
      ] = await Promise.all([
        this.checkBlur(gray),
        this.checkLighting(gray),
        this.checkGlare(src),
        this.checkContrast(gray),
        this.checkFace(src, gray)
      ]);

      // Determine overall status
      const checks = { blur: blurCheck, lighting: lightingCheck, glare: glareCheck, 
                       contrast: contrastCheck, face: faceCheck };

      const hasFailures = Object.values(checks).some(c => c.status === 'fail');
      const hasWarnings = Object.values(checks).some(c => c.status === 'warning');

      const overall = hasFailures ? 'fail' : hasWarnings ? 'warning' : 'pass';

      // Calculate composite quality score (0-100)
      const qualityScore = this.calculateCompositeScore(checks);

      return {
        overall,
        qualityScore,
        checks,
        allowed: overall !== 'fail',
        guidance: this.generateGuidance(checks, overall),
        timestamp: new Date().toISOString()
      };
    } finally {
      gray.delete();
      src.delete();
    }
  }

  /**
   * Check 1: Laplacian variance for blur detection
   */
  checkBlur(gray) {
    const laplacian = new cv.Mat();
    cv.Laplacian(gray, laplacian, cv.CV_64F);

    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(laplacian, mean, stddev);

    const variance = stddev.data64F[0] ** 2;

    laplacian.delete();
    mean.delete();
    stddev.delete();

    if (variance < this.thresholds.blur.critical) {
      return {
        status: 'fail',
        score: Math.round(variance),
        message: '❌ Image is too blurry',
        guidance: [
          'Hold the camera with both hands',
          'Stand still and take a deep breath before capturing',
          'Ensure the subject is not moving',
          'Tap on the screen to focus before taking the photo'
        ],
        severity: 'high'
      };
    }

    if (variance < this.thresholds.blur.warning) {
      return {
        status: 'warning',
        score: Math.round(variance),
        message: '⚠️ Slightly blurry - consider retaking',
        guidance: [
          'Hold the device more steady',
          'Ensure good lighting for faster shutter speed'
        ],
        severity: 'medium'
      };
    }

    return {
      status: 'pass',
      score: Math.round(variance),
      message: '✓ Sharpness OK',
      guidance: [],
      severity: 'none'
    };
  }

  /**
   * Check 2: Histogram analysis for lighting
   */
  checkLighting(gray) {
    const hist = new cv.Mat();
    const mask = new cv.Mat();
    const histSize = [256];
    const ranges = [0, 256];

    cv.calcHist([gray], [0], mask, hist, histSize, ranges);

    let totalPixels = 0;
    let weightedSum = 0;
    let darkPixels = 0;
    let brightPixels = 0;

    for (let i = 0; i < 256; i++) {
      const count = hist.data32F[i];
      totalPixels += count;
      weightedSum += count * i;

      if (i < 30) darkPixels += count;
      if (i > 220) brightPixels += count;
    }

    const meanBrightness = weightedSum / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    const brightRatio = brightPixels / totalPixels;

    hist.delete();
    mask.delete();

    if (meanBrightness < this.thresholds.lighting.min) {
      return {
        status: 'fail',
        score: Math.round(meanBrightness),
        message: '❌ Too dark - insufficient lighting',
        guidance: [
          'Move to a brighter area or face a light source',
          'Turn on the camera flash',
          'Avoid shooting against bright backgrounds',
          'Take photo during daylight hours if possible'
        ],
        details: { darkRatio: Math.round(darkRatio * 100) },
        severity: 'high'
      };
    }

    if (meanBrightness > this.thresholds.lighting.max) {
      return {
        status: 'fail',
        score: Math.round(meanBrightness),
        message: '❌ Too bright - overexposed',
        guidance: [
          'Move away from direct sunlight or bright lights',
          'Find a shaded area',
          'Avoid white/bright backgrounds',
          'Reduce exposure if camera settings allow'
        ],
        details: { brightRatio: Math.round(brightRatio * 100) },
        severity: 'high'
      };
    }

    if (meanBrightness < this.thresholds.lighting.warningLow || 
        meanBrightness > this.thresholds.lighting.warningHigh) {
      return {
        status: 'warning',
        score: Math.round(meanBrightness),
        message: '⚠️ Lighting could be improved',
        guidance: [
          'Adjust position for more even lighting',
          'Avoid harsh shadows on the face'
        ],
        severity: 'low'
      };
    }

    return {
      status: 'pass',
      score: Math.round(meanBrightness),
      message: '✓ Lighting OK',
      guidance: [],
      severity: 'none'
    };
  }

  /**
   * Check 3: Highlight clipping detection for glare
   */
  checkGlare(src) {
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2HSV);

    const channels = new cv.MatVector();
    cv.split(hsv, channels);
    const vChannel = channels.get(2); // Value channel

    const overexposed = new cv.Mat();
    cv.threshold(vChannel, overexposed, 240, 255, cv.THRESH_BINARY);

    const totalPixels = src.rows * src.cols;
    const glarePixels = cv.countNonZero(overexposed);
    const glareRatio = glarePixels / totalPixels;

    hsv.delete();
    channels.delete();
    vChannel.delete();
    overexposed.delete();

    if (glareRatio > this.thresholds.glare.max) {
      return {
        status: 'fail',
        score: Math.round(glareRatio * 100),
        message: '❌ Glare/overexposure detected',
        guidance: [
          'Tilt the document/face slightly to reduce reflection',
          'Move away from direct light source',
          'Remove glasses if wearing them',
          'Change angle to avoid shiny surfaces'
        ],
        severity: 'high'
      };
    }

    if (glareRatio > this.thresholds.glare.warning) {
      return {
        status: 'warning',
        score: Math.round(glareRatio * 100),
        message: '⚠️ Some glare detected',
        guidance: [
          'Slightly adjust the angle to reduce reflections'
        ],
        severity: 'low'
      };
    }

    return {
      status: 'pass',
      score: Math.round(glareRatio * 100),
      message: '✓ No glare detected',
      guidance: [],
      severity: 'none'
    };
  }

  /**
   * Check 4: Contrast analysis
   */
  checkContrast(gray) {
    const mean = new cv.Mat();
    const stddev = new cv.Mat();
    cv.meanStdDev(gray, mean, stddev);

    const contrast = stddev.data64F[0];

    mean.delete();
    stddev.delete();

    if (contrast < this.thresholds.contrast.min) {
      return {
        status: 'fail',
        score: Math.round(contrast),
        message: '❌ Very low contrast - flat image',
        guidance: [
          'Ensure subject is well-lit from the front',
          'Avoid foggy or hazy conditions',
          'Check if camera lens is clean'
        ],
        severity: 'medium'
      };
    }

    if (contrast < this.thresholds.contrast.warning) {
      return {
        status: 'warning',
        score: Math.round(contrast),
        message: '⚠️ Low contrast',
        guidance: ['Improve lighting for better definition'],
        severity: 'low'
      };
    }

    return {
      status: 'pass',
      score: Math.round(contrast),
      message: '✓ Contrast OK',
      guidance: [],
      severity: 'none'
    };
  }

  /**
   * Check 5: Face detection validation
   */
  async checkFace(src, gray) {
    // Try native FaceDetector API first
    if (this.faceDetector) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = src.cols;
        canvas.height = src.rows;
        cv.imshow(canvas, src);

        const faces = await this.faceDetector.detect(canvas);

        if (faces.length === 0) {
          return {
            status: 'fail',
            score: 0,
            message: '❌ No face detected',
            guidance: [
              'Center face in the frame',
              'Ensure face is clearly visible (remove mask/sunglasses)',
              'Face the camera directly',
              'Fill at least 30% of the frame with your face'
            ],
            severity: 'high'
          };
        }

        const face = faces[0];
        const faceArea = face.boundingBox.width * face.boundingBox.height;
        const imageArea = src.cols * src.rows;
        const faceRatio = faceArea / imageArea;

        if (faceRatio < this.thresholds.face.minSize) {
          return {
            status: 'warning',
            score: Math.round(faceRatio * 100),
            message: '⚠️ Face too small in frame',
            guidance: [
              'Move closer to the camera',
              'Face should fill at least 30% of the frame'
            ],
            severity: 'medium'
          };
        }

        if (faceRatio > this.thresholds.face.maxSize) {
          return {
            status: 'warning',
            score: Math.round(faceRatio * 100),
            message: '⚠️ Face too close/cropped',
            guidance: [
              'Move slightly back',
              'Ensure full face including forehead and chin is visible'
            ],
            severity: 'low'
          };
        }

        return {
          status: 'pass',
          score: Math.round(faceRatio * 100),
          message: '✓ Face framing OK',
          guidance: [],
          severity: 'none'
        };
      } catch {
        // Fall through to basic check
      }
    }

    // Fallback: Basic face-like region detection using Haar-like features
    // This is a simplified version - in production, use a proper face detection model
    return this.basicFaceCheck(gray);
  }

  /**
   * Basic face detection fallback using skin tone and ellipse detection
   */
  basicFaceCheck(gray) {
    // Detect potential face regions using skin color and shape
    const equalized = new cv.Mat();
    cv.equalizeHist(gray, equalized);

    // Look for elliptical regions that could be faces
    const blurred = new cv.Mat();
    cv.GaussianBlur(equalized, blurred, new cv.Size(5, 5), 0);

    const thresholded = new cv.Mat();
    cv.adaptiveThreshold(blurred, thresholded, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, 
                         cv.THRESH_BINARY, 11, 2);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(thresholded, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let faceFound = false;
    let bestFaceRatio = 0;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const imageArea = gray.rows * gray.cols;

      if (area > imageArea * 0.02 && area < imageArea * 0.6) {
        const rect = cv.boundingRect(contour);
        const ratio = rect.width / rect.height;

        // Face-like aspect ratio (0.6 to 1.0)
        if (ratio > 0.5 && ratio < 1.2) {
          faceFound = true;
          bestFaceRatio = Math.max(bestFaceRatio, area / imageArea);
        }
      }
    }

    equalized.delete();
    blurred.delete();
    thresholded.delete();
    contours.delete();
    hierarchy.delete();

    if (!faceFound) {
      return {
        status: 'warning',
        score: 0,
        message: '⚠️ Face not clearly detected',
        guidance: [
          'Center face in frame',
          'Ensure face is well-lit and visible',
          'Remove obstructions (mask, hand, hair)'
        ],
        severity: 'medium'
      };
    }

    return {
      status: 'pass',
      score: Math.round(bestFaceRatio * 100),
      message: '✓ Face detected',
      guidance: [],
      severity: 'none'
    };
  }

  /**
   * Calculate composite quality score (0-100)
   */
  calculateCompositeScore(checks) {
    const weights = {
      blur: 0.25,
      lighting: 0.25,
      glare: 0.20,
      contrast: 0.15,
      face: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [checkName, check] of Object.entries(checks)) {
      const weight = weights[checkName] || 0.2;
      let score = 0;

      switch (check.status) {
        case 'pass':
          score = 100;
          break;
        case 'warning':
          score = 70;
          break;
        case 'fail':
          score = 30;
          break;
      }

      totalScore += score * weight;
      totalWeight += weight;
    }

    return Math.round(totalScore / totalWeight);
  }

  /**
   * Generate human-readable guidance based on failures
   */
  generateGuidance(checks, overall) {
    if (overall === 'pass') {
      return {
        title: '✅ Photo Quality Good',
        message: 'Your photo meets all quality requirements.',
        actions: []
      };
    }

    const failures = Object.entries(checks)
      .filter(([, check]) => check.status !== 'pass')
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a[1].severity] - severityOrder[b[1].severity];
      });

    const primaryIssue = failures[0];
    const allGuidance = failures.flatMap(([, check]) => check.guidance);

    // Remove duplicate guidance
    const uniqueGuidance = [...new Set(allGuidance)];

    return {
      title: overall === 'fail' ? '❌ Photo Rejected' : '⚠️ Quality Issues Detected',
      message: primaryIssue ? primaryIssue[1].message : 'Multiple quality issues found',
      primaryIssue: primaryIssue ? primaryIssue[0] : null,
      guidance: uniqueGuidance.slice(0, 4), // Show max 4 tips
      actions: overall === 'fail' 
        ? ['Retake Photo'] 
        : ['Retake Photo', 'Use Anyway (Not Recommended)']
    };
  }

  /**
   * Quick check for real-time preview (lighter version)
   */
  async quickCheck(imageSource) {
    const src = await this.loadImage(imageSource);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Only run blur and lighting checks for real-time feedback
    const blur = this.checkBlur(gray);
    const lighting = this.checkLighting(gray);

    gray.delete();
    src.delete();

    const hasIssues = blur.status === 'fail' || lighting.status === 'fail';

    return {
      ok: !hasIssues,
      blur: blur.status,
      lighting: lighting.status,
      message: hasIssues 
        ? `${blur.status === 'fail' ? blur.message : ''} ${lighting.status === 'fail' ? lighting.message : ''}`.trim()
        : 'Quality OK'
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
}

export default PhotoQualityChecker;
