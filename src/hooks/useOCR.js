/**
 * useOCR Hook
 * Manages OCR workflow: preprocessing → recognition → correction → confidence scoring
 */

import { useState, useCallback, useRef } from 'react';
import { ImagePreprocessor } from '../utils/imagePreprocessing';
import { BanglaCorrector } from '../utils/banglaCorrector';
import { OCRLearningMemory } from '../utils/ocrLearningMemory';

export const useOCR = () => {
  const [state, setState] = useState({
    isProcessing: false,
    stage: '',
    results: [],
    error: null,
    quality: null
  });

  const preprocessorRef = useRef(new ImagePreprocessor());
  const correctorRef = useRef(new BanglaCorrector());
  const memoryRef = useRef(new OCRLearningMemory());

  const processImage = useCallback(async (imageFile, options = {}) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Stage 1: Preprocessing
      setState(prev => ({ ...prev, stage: 'preprocessing' }));
      const { processedImage, textRegions, qualityScore } = 
        await preprocessorRef.current.preprocess(imageFile);

      // Stage 2: OCR Recognition (using Tesseract.js)
      setState(prev => ({ ...prev, stage: 'recognizing' }));
      const rawResults = await performOCR(processedImage, textRegions, options);

      // Stage 3: Apply Learning Memory
      setState(prev => ({ ...prev, stage: 'applying_memory' }));
      const learnedResults = memoryRef.current.batchCheck(rawResults);

      // Stage 4: Bangla Correction
      setState(prev => ({ ...prev, stage: 'correcting' }));
      const correctedResults = learnedResults.map(field => {
        if (field.source === 'learned_auto') return field;

        const banglaCorrected = correctorRef.current.correct(field.value, field.type);

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

      setState({
        isProcessing: false,
        stage: '',
        results: correctedResults,
        error: null,
        quality: qualityScore
      });

      return correctedResults;

    } catch (error) {
      setState({
        isProcessing: false,
        stage: '',
        results: [],
        error: error.message,
        quality: null
      });
      throw error;
    }
  }, []);

  const recordCorrection = useCallback((ocrText, correctedText, fieldType, context) => {
    memoryRef.current.recordCorrection(ocrText, correctedText, fieldType, context);
  }, []);

  const getStats = useCallback(() => {
    return memoryRef.current.getStats();
  }, []);

  return {
    ...state,
    processImage,
    recordCorrection,
    getStats
  };
};

// Helper: Perform OCR using Tesseract.js
async function performOCR(imageBlob, textRegions, options) {
  // Dynamic import to avoid bundling if not needed
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('ben'); // Bangla language

  const results = [];

  for (const region of textRegions) {
    const result = await worker.recognize(imageBlob, {
      rectangle: { 
        left: region.x, 
        top: region.y, 
        width: region.w, 
        height: region.h 
      }
    });

    results.push({
      text: result.data.text.trim(),
      confidence: result.data.confidence / 100,
      bbox: region
    });
  }

  await worker.terminate();

  return results;
}

export default useOCR;
