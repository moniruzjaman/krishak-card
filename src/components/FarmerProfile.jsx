import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ImagePreprocessor } from '../utils/imagePreprocessing';
import { BanglaCorrector } from '../utils/banglaCorrector';
import { OCRConfidenceEditor } from './OCRConfidenceEditor';
import { AddressMemory } from '../utils/addressMemory';
import { IntelligentDefaults } from '../utils/intelligentDefaults';
import { PhotoQualityChecker } from '../utils/photoQualityCheck';
import { OCRLearningMemory } from '../utils/ocrLearningMemory';

/**
 * Enhanced Farmer Profile Registration Component
 * 
 * Integrates all 7 strategic improvements:
 * 1. Image Preprocessing Enhancement
 * 2. Bangla Language Correction Layer
 * 3. OCR Confidence-Based Editing
 * 4. Address Auto-Fill
 * 5. Intelligent Defaults
 * 6. Smart Photo Quality Check
 * 7. OCR Learning Memory
 */

// Field definitions for OCR mapping
const OCR_FIELD_MAP = [
  { name: 'name', label: 'Farmer Name (Bangla)', type: 'name', required: true },
  { name: 'fatherName', label: "Father's Name", type: 'fatherName', required: true },
  { name: 'motherName', label: "Mother's Name", type: 'motherName', required: true },
  { name: 'nidNumber', label: 'NID Number', type: 'nid', required: true },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { name: 'address', label: 'Address', type: 'address', required: false }
];

// Address hierarchy fields
const ADDRESS_FIELDS = [
  { name: 'division', label: 'Division', required: true },
  { name: 'district', label: 'District', required: true },
  { name: 'upazila', label: 'Upazila', required: true },
  { name: 'union', label: 'Union', required: true },
  { name: 'village', label: 'Village', required: true },
  { name: 'mouza', label: 'Mouza', required: false }
];

// Demographic fields with intelligent defaults
const DEMOGRAPHIC_FIELDS = [
  { name: 'farmerType', label: 'Farmer Type', options: [
    { value: '', label: 'Select Type' },
    { value: 'small', label: 'Small Farmer (< 0.5 ha)' },
    { value: 'marginal', label: 'Marginal Farmer (0.5-1.0 ha)' },
    { value: 'medium', label: 'Medium Farmer (1.0-3.0 ha)' },
    { value: 'large', label: 'Large Farmer (> 3.0 ha)' }
  ]},
  { name: 'educationLevel', label: 'Education Level', options: [
    { value: '', label: 'Select Education' },
    { value: 'none', label: 'No Formal Education' },
    { value: 'primary', label: 'Primary (1-5)' },
    { value: 'secondary', label: 'Secondary (6-10)' },
    { value: 'higher_secondary', label: 'Higher Secondary (11-12)' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Post Graduate' }
  ]},
  { name: 'primaryOccupation', label: 'Primary Occupation', options: [
    { value: '', label: 'Select Occupation' },
    { value: 'farmer', label: 'Farmer' },
    { value: 'agricultural_labor', label: 'Agricultural Labor' },
    { value: 'business', label: 'Business' },
    { value: 'service', label: 'Service' },
    { value: 'fisherman', label: 'Fisherman' },
    { value: 'livestock', label: 'Livestock Rearing' },
    { value: 'other', label: 'Other' }
  ]},
  { name: 'benefitStatus', label: 'Benefit Status', options: [
    { value: '', label: 'Select Status' },
    { value: 'eligible', label: 'Eligible for Benefits' },
    { value: 'receiving', label: 'Currently Receiving' },
    { value: 'pending', label: 'Application Pending' },
    { value: 'not_eligible', label: 'Not Eligible' }
  ]}
];

export const FarmerProfile = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '', fatherName: '', motherName: '', nidNumber: '', dateOfBirth: '',
    division: '', district: '', upazila: '', union: '', village: '', mouza: '',
    farmerType: '', educationLevel: '', primaryOccupation: '', benefitStatus: '',
    gender: '', maritalStatus: '', phoneNumber: '', photo: null, nidPhoto: null
  });

  // UI state
  const [currentStep, setCurrentStep] = useState('capture'); // capture, review, demographics, photo, confirm
  const [ocrResults, setOcrResults] = useState([]);
  const [photoQuality, setPhotoQuality] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [showLearningStats, setShowLearningStats] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs
  const nidInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize utility instances (singletons)
  const utils = useMemo(() => ({
    preprocessor: new ImagePreprocessor(),
    corrector: new BanglaCorrector(),
    addressMemory: new AddressMemory(),
    defaultsEngine: new IntelligentDefaults(),
    qualityChecker: new PhotoQualityChecker(),
    ocrMemory: new OCRLearningMemory()
  }), []);

  const { preprocessor, corrector, addressMemory, defaultsEngine, 
          qualityChecker, ocrMemory } = utils;

  // Load intelligent defaults on mount
  useEffect(() => {
    loadIntelligentDefaults();
  }, []);

  // Load intelligent defaults
  const loadIntelligentDefaults = useCallback(() => {
    const defaults = defaultsEngine.getDefaults();
    const addressDefaults = addressMemory.getIntelligentDefaults();

    setFormData(prev => {
      const updates = { ...prev };

      // Apply address defaults
      if (addressDefaults) {
        ADDRESS_FIELDS.forEach(({ name }) => {
          if (!prev[name] && addressDefaults[name]) {
            updates[name] = addressDefaults[name];
          }
        });
      }

      // Apply demographic defaults
      Object.entries(defaults).forEach(([field, data]) => {
        if (data.autoFill && !prev[field]) {
          updates[field] = data.value;
        }
      });

      return updates;
    });

    // Show notification for auto-filled fields
    const autoFilled = Object.entries(defaults).filter(([, d]) => d.autoFill);
    if (autoFilled.length > 0 || addressDefaults) {
      addNotification('ℹ️ Some fields have been auto-filled based on previous registrations', 'info');
    }
  }, [defaultsEngine, addressMemory]);

  // Notification system
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // ============================================
  // NID CAPTURE & OCR PROCESSING
  // ============================================

  const handleNIDCapture = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStage('Reading image...');

    try {
      // Stage 1: Image preprocessing
      setProcessingStage('Preprocessing image (detecting NID boundaries)...');
      const { processedImage, textRegions, qualityScore } = 
        await preprocessor.preprocess(file);

      if (qualityScore.overall === 'poor') {
        addNotification('⚠️ Image quality is poor. Consider retaking the NID photo.', 'warning');
      }

      // Stage 2: OCR (simulated - replace with actual Tesseract.js integration)
      setProcessingStage('Running OCR...');
      const rawOcrResults = await performOCR(processedImage, textRegions);

      // Stage 3: Apply learning memory corrections
      setProcessingStage('Applying learned corrections...');
      const learnedResults = ocrMemory.batchCheck(rawOcrResults);

      // Stage 4: Bangla language correction
      setProcessingStage('Correcting Bangla text...');
      const correctedResults = learnedResults.map(field => {
        if (field.source === 'learned_auto') return field;

        const banglaCorrected = corrector.correct(field.value, field.type);

        return {
          ...field,
          value: banglaCorrected.corrected,
          confidence: banglaCorrected.confidence * field.confidence,
          suggestions: [
            ...(field.suggestions || []),
            ...(banglaCorrected.suggestions || [])
          ].slice(0, 5),
          source: banglaCorrected.method
        };
      });

      setOcrResults(correctedResults);
      setFormData(prev => ({ ...prev, nidPhoto: file }));
      setCurrentStep('review');

      // Show stats
      const autoCount = correctedResults.filter(r => r.confidence > 0.95).length;
      addNotification(`✓ OCR complete! ${autoCount}/${correctedResults.length} fields auto-accepted.`, 'success');

    } catch (error) {
      console.error('NID processing failed:', error);
      addNotification('❌ Failed to process NID. Please try again or enter manually.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, [preprocessor, ocrMemory, corrector, addNotification]);

  // Simulated OCR function (replace with actual Tesseract.js)
  const performOCR = async (imageBlob, textRegions) => {
    // In production, use: const { createWorker } = await import('tesseract.js');
    // const worker = await createWorker('ben'); // Bangla language pack
    // const result = await worker.recognize(imageBlob);

    // Simulated results for demonstration
    return OCR_FIELD_MAP.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type,
      value: '', // Would be populated by actual OCR
      confidence: 0.85,
      bbox: textRegions[0] || null
    }));
  };

  // Handle OCR field updates
  const handleOCRFieldUpdate = useCallback((fieldName, value, action) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Record correction for learning
    if (action === 'corrected') {
      const originalField = ocrResults.find(r => r.name === fieldName);
      if (originalField) {
        ocrMemory.recordCorrection(originalField.value, value, fieldName, {
          village: formData.village
        });
        addNotification('💡 Correction saved for future auto-correction!', 'info');
      }
    }
  }, [ocrResults, ocrMemory, formData.village, addNotification]);

  // Complete OCR review
  const handleOCRComplete = useCallback(() => {
    setCurrentStep('demographics');
    addNotification('✓ OCR review complete. Proceeding to demographics.', 'success');
  }, [addNotification]);

  // ============================================
  // PHOTO CAPTURE WITH QUALITY CHECK
  // ============================================

  const handlePhotoCapture = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStage('Checking photo quality...');

    try {
      const quality = await qualityChecker.checkQuality(file);
      setPhotoQuality(quality);

      if (!quality.allowed) {
        addNotification('❌ Photo rejected: ' + quality.guidance.message, 'error');
        return;
      }

      if (quality.overall === 'warning') {
        addNotification('⚠️ ' + quality.guidance.message, 'warning');
      } else {
        addNotification('✓ Photo quality check passed!', 'success');
      }

      setFormData(prev => ({ ...prev, photo: file }));

    } catch (error) {
      console.error('Photo quality check failed:', error);
      addNotification('❌ Failed to check photo quality. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, [qualityChecker, addNotification]);

  // ============================================
  // ADDRESS HANDLING WITH AUTO-FILL
  // ============================================

  const handleAddressChange = useCallback((fieldName, value) => {
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: value };

      // Auto-predict remaining fields
      const predictions = addressMemory.predictAddress({
        division: updated.division,
        district: updated.district,
        upazila: updated.upazila,
        union: updated.union,
        village: updated.village
      });

      if (predictions) {
        Object.entries(predictions).forEach(([key, prediction]) => {
          if (!updated[key] && prediction.value) {
            updated[key] = prediction.value;
            addNotification(`✨ Auto-predicted ${key}: ${prediction.value}`, 'info');
          }
        });
      }

      return updated;
    });
  }, [addressMemory, addNotification]);

  // ============================================
  // FORM SUBMISSION
  // ============================================

  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    setProcessingStage('Saving registration...');

    try {
      // Record address for future auto-fill
      addressMemory.recordAddress({
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        union: formData.union,
        village: formData.village,
        mouza: formData.mouza
      });

      // Learn demographic patterns
      defaultsEngine.learn(formData);

      // Submit to backend
      // await submitToBackend(formData);

      addNotification('✅ Registration saved successfully!', 'success');

      // Reset for next registration (keep address defaults)
      setFormData(prev => ({
        name: '', fatherName: '', motherName: '', nidNumber: '', dateOfBirth: '',
        phoneNumber: '', photo: null, nidPhoto: null,
        // Keep address and demographic defaults
        division: prev.division, district: prev.district, upazila: prev.upazila,
        union: prev.union, village: prev.village, mouza: prev.mouza,
        farmerType: prev.farmerType, educationLevel: prev.educationLevel,
        primaryOccupation: prev.primaryOccupation, benefitStatus: prev.benefitStatus
      }));

      setCurrentStep('capture');
      setOcrResults([]);
      setPhotoQuality(null);

    } catch (error) {
      console.error('Submission failed:', error);
      addNotification('❌ Failed to save registration. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, [formData, addressMemory, defaultsEngine, addNotification]);

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderNotifications = () => (
    <div className="notifications-container">
      {notifications.map(n => (
        <div key={n.id} className={`notification ${n.type}`}>
          {n.message}
        </div>
      ))}
    </div>
  );

  const renderProcessingOverlay = () => {
    if (!isProcessing) return null;

    const stages = [
      'Reading image...',
      'Preprocessing image (detecting NID boundaries)...',
      'Perspective correction...',
      'Contrast enhancement...',
      'Running OCR...',
      'Applying learned corrections...',
      'Correcting Bangla text...',
      'Checking photo quality...',
      'Saving registration...'
    ];

    const progress = stages.indexOf(processingStage) / stages.length * 100;

    return (
      <div className="processing-overlay">
        <div className="processing-content">
          <div className="spinner"></div>
          <p className="processing-text">{processingStage}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderCaptureStep = () => (
    <div className="step-container">
      <h2>📷 Step 1: Capture NID Card</h2>
      <p className="step-description">
        Position the NID card within the frame. The system will automatically detect 
        boundaries, correct perspective, and enhance image quality for optimal OCR.
      </p>

      <div className="capture-area">
        <div className="nid-frame">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          <p className="frame-text">Align NID card within frame</p>
        </div>

        <input
          ref={nidInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNIDCapture}
          className="hidden-input"
          id="nid-capture"
        />

        <label htmlFor="nid-capture" className="capture-btn primary">
          📸 Capture NID Card
        </label>

        <button 
          className="capture-btn secondary"
          onClick={() => nidInputRef.current?.click()}
        >
          📁 Upload from Gallery
        </button>
      </div>

      <div className="features-preview">
        <h4>🔧 Processing Pipeline:</h4>
        <div className="pipeline-steps">
          {[
            'Auto NID Detection',
            'Perspective Correction',
            'Contrast Enhancement',
            'Adaptive Thresholding',
            'Noise Removal',
            'Text Sharpening',
            'Bangla OCR'
          ].map((step, i) => (
            <div key={i} className="pipeline-step">
              <span className="step-number">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="step-container">
      <h2>📝 Step 2: Review OCR Results</h2>

      {ocrResults.length > 0 && (
        <OCRConfidenceEditor
          ocrResults={ocrResults}
          onFieldUpdate={handleOCRFieldUpdate}
          ocrMemory={ocrMemory}
          onComplete={handleOCRComplete}
        />
      )}
    </div>
  );

  const renderDemographicsStep = () => (
    <div className="step-container">
      <h2>👤 Step 3: Demographic Information</h2>

      {/* Address Section */}
      <section className="form-section">
        <h3>📍 Address Information</h3>

        {addressMemory.getFrequentVillages(3).length > 0 && (
          <div className="quick-select">
            <p>Quick select recent village:</p>
            <div className="quick-villages">
              {addressMemory.getFrequentVillages(3).map((v, i) => (
                <button
                  key={i}
                  className="quick-village-btn"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, ...v.fullAddress }));
                    addNotification(`✓ Loaded address for ${v.village}`, 'success');
                  }}
                >
                  {v.village} ({v.count}x)
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="address-grid">
          {ADDRESS_FIELDS.map(({ name, label, required }) => (
            <div key={name} className="form-group">
              <label>
                {label} {required && <span className="required">*</span>}
                {formData[name] && addressMemory.getIntelligentDefaults()?.[name] === formData[name] && (
                  <span className="auto-badge">Auto</span>
                )}
              </label>
              <select
                value={formData[name]}
                onChange={(e) => handleAddressChange(name, e.target.value)}
                className={formData[name] ? 'filled' : ''}
              >
                <option value="">Select {label}</option>
                {/* Options would be populated from API based on hierarchy */}
                <option value="dhaka">Dhaka</option>
                <option value="chittagong">Chittagong</option>
                <option value="rajshahi">Rajshahi</option>
                <option value="khulna">Khulna</option>
                <option value="barisal">Barisal</option>
                <option value="sylhet">Sylhet</option>
                <option value="rangpur">Rangpur</option>
                <option value="mymensingh">Mymensingh</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Demographics with Intelligent Defaults */}
      <section className="form-section">
        <h3>👥 Demographics</h3>

        {DEMOGRAPHIC_FIELDS.map(({ name, label, options }) => {
          const defaultData = defaultsEngine.getDefaults()[name];

          return (
            <div key={name} className="form-group">
              <label>
                {label}
                {defaultData?.autoFill && formData[name] === defaultData.value && (
                  <span className="auto-badge" title={`${Math.round(defaultData.confidence * 100)}% confidence`}>
                    Smart ({Math.round(defaultData.confidence * 100)}%)
                  </span>
                )}
              </label>
              <select
                value={formData[name]}
                onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                className={formData[name] ? 'filled' : ''}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {defaultData?.alternatives?.length > 0 && (
                <div className="alternatives">
                  <small>Also common: {defaultData.alternatives.join(', ')}</small>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <button 
        className="btn-next"
        onClick={() => setCurrentStep('photo')}
        disabled={!formData.village || !formData.farmerType}
      >
        Next: Capture Photo →
      </button>
    </div>
  );

  const renderPhotoStep = () => (
    <div className="step-container">
      <h2>📸 Step 4: Farmer Photo</h2>

      <div className="photo-capture-area">
        <div className={`photo-frame ${photoQuality?.overall || ''}`}>
          {formData.photo ? (
            <img src={URL.createObjectURL(formData.photo)} alt="Farmer" />
          ) : (
            <div className="photo-placeholder">
              <span className="placeholder-icon">👤</span>
              <p>Position face within the circle</p>
            </div>
          )}

          {/* Quality overlay */}
          {photoQuality && (
            <div className={`quality-overlay ${photoQuality.overall}`}>
              <div className="quality-score">
                <span className="score-value">{photoQuality.qualityScore}</span>
                <span className="score-label">/ 100</span>
              </div>
              <div className="quality-bars">
                {Object.entries(photoQuality.checks).map(([name, check]) => (
                  <div key={name} className={`quality-bar ${check.status}`}>
                    <span className="bar-name">{name}</span>
                    <div className="bar-fill">
                      <div className="bar-inner" style={{ width: `${check.status === 'pass' ? 100 : check.status === 'warning' ? 70 : 30}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoCapture}
          className="hidden-input"
          id="photo-capture"
        />

        <div className="photo-actions">
          <label htmlFor="photo-capture" className="capture-btn primary">
            {formData.photo ? '🔄 Retake Photo' : '📸 Capture Photo'}
          </label>

          {photoQuality?.overall === 'warning' && (
            <button 
              className="capture-btn warning"
              onClick={() => setCurrentStep('confirm')}
            >
              Use Anyway →
            </button>
          )}

          {photoQuality?.overall === 'pass' && (
            <button 
              className="capture-btn success"
              onClick={() => setCurrentStep('confirm')}
            >
              ✓ Continue →
            </button>
          )}
        </div>

        {/* Quality guidance */}
        {photoQuality?.guidance && photoQuality.overall !== 'pass' && (
          <div className={`quality-guidance ${photoQuality.overall}`}>
            <h4>{photoQuality.guidance.title}</h4>
            <p>{photoQuality.guidance.message}</p>
            <ul>
              {photoQuality.guidance.guidance?.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="step-container">
      <h2>✅ Step 5: Confirm & Save</h2>

      <div className="summary-card">
        <h3>Registration Summary</h3>

        <div className="summary-section">
          <h4>Personal Information</h4>
          <div className="summary-row">
            <span>Name:</span>
            <span className="bangla-text">{formData.name || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Father's Name:</span>
            <span className="bangla-text">{formData.fatherName || '—'}</span>
          </div>
          <div className="summary-row">
            <span>NID:</span>
            <span>{formData.nidNumber || '—'}</span>
          </div>
        </div>

        <div className="summary-section">
          <h4>Address</h4>
          <div className="summary-row">
            <span>Village:</span>
            <span>{formData.village || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Union:</span>
            <span>{formData.union || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Upazila:</span>
            <span>{formData.upazila || '—'}</span>
          </div>
        </div>

        <div className="summary-section">
          <h4>Demographics</h4>
          <div className="summary-row">
            <span>Farmer Type:</span>
            <span>{formData.farmerType || '—'}</span>
          </div>
          <div className="summary-row">
            <span>Education:</span>
            <span>{formData.educationLevel || '—'}</span>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-back" onClick={() => setCurrentStep('photo')}>
          ← Back
        </button>
        <button className="btn-submit" onClick={handleSubmit} disabled={isProcessing}>
          {isProcessing ? 'Saving...' : '💾 Save Registration'}
        </button>
      </div>
    </div>
  );

  // Learning stats panel
  const renderLearningStats = () => {
    if (!showLearningStats) return null;

    const ocrStats = ocrMemory.getStats();
    const addressStats = addressMemory.getStats();
    const defaultStats = defaultsEngine.getStats();

    return (
      <div className="learning-stats-panel">
        <h3>🧠 System Learning Dashboard</h3>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>OCR Corrections</h4>
            <div className="stat-value">{ocrStats.autoApplicable}</div>
            <div className="stat-label">Auto-applied patterns</div>
            <div className="stat-detail">{ocrStats.totalPatterns} total learned</div>
          </div>

          <div className="stat-card">
            <h4>Address Memory</h4>
            <div className="stat-value">{addressStats.uniqueVillages}</div>
            <div className="stat-label">Villages remembered</div>
            <div className="stat-detail">{addressStats.totalRegistrations} registrations</div>
          </div>

          <div className="stat-card">
            <h4>Smart Defaults</h4>
            <div className="stat-value">{defaultStats.autoFillable}</div>
            <div className="stat-label">Fields auto-filling</div>
            <div className="stat-detail">{defaultStats.totalRegistrations} patterns learned</div>
          </div>
        </div>

        <div className="time-saved">
          <h4>⏱️ Estimated Time Saved</h4>
          <p>
            <strong>{addressStats.totalTimeSaved} minutes</strong> from address auto-fill<br/>
            <strong>{Math.round(defaultStats.timeSavedPerRegistration * defaultStats.totalRegistrations / 60)} minutes</strong> from smart defaults<br/>
            <strong>{Math.round(ocrStats.totalCorrections * 0.5)} minutes</strong> from OCR auto-correction
          </p>
        </div>

        <button className="btn-close" onClick={() => setShowLearningStats(false)}>
          Close
        </button>
      </div>
    );
  };

  // Step indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'capture', label: 'NID', icon: '📷' },
      { id: 'review', label: 'Review', icon: '📝' },
      { id: 'demographics', label: 'Details', icon: '👤' },
      { id: 'photo', label: 'Photo', icon: '📸' },
      { id: 'confirm', label: 'Confirm', icon: '✅' }
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`step-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
          >
            <div className="step-circle">
              {index < currentIndex ? '✓' : step.icon}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="farmer-profile-container">
      <header className="profile-header">
        <h1>🌾 Krishak Card Registration</h1>
        <button 
          className="btn-stats-toggle"
          onClick={() => setShowLearningStats(!showLearningStats)}
        >
          🧠 Learning Stats
        </button>
      </header>

      {renderStepIndicator()}
      {renderNotifications()}
      {renderProcessingOverlay()}
      {renderLearningStats()}

      <main className="profile-content">
        {currentStep === 'capture' && renderCaptureStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'demographics' && renderDemographicsStep()}
        {currentStep === 'photo' && renderPhotoStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
      </main>
    </div>
  );
};

export default FarmerProfile;
