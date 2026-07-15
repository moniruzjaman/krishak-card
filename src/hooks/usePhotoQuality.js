/**
 * usePhotoQuality Hook
 * Real-time photo quality checking with debouncing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { PhotoQualityChecker } from '../utils/photoQualityCheck';

export const usePhotoQuality = (options = {}) => {
  const { debounceMs = 500, enableRealtime = false } = options;

  const [state, setState] = useState({
    isChecking: false,
    result: null,
    error: null
  });

  const checkerRef = useRef(new PhotoQualityChecker());
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const checkQuality = useCallback(async (imageSource) => {
    // Cancel previous check
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const result = await checkerRef.current.checkQuality(imageSource);

      if (!abortControllerRef.current.signal.aborted) {
        setState({
          isChecking: false,
          result,
          error: null
        });
      }

      return result;
    } catch (error) {
      if (!abortControllerRef.current.signal.aborted) {
        setState({
          isChecking: false,
          result: null,
          error: error.message
        });
      }
      throw error;
    }
  }, []);

  // Debounced version for real-time preview
  const checkQualityDebounced = useCallback((imageSource) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      checkQuality(imageSource);
    }, debounceMs);
  }, [checkQuality, debounceMs]);

  // Real-time video stream quality check
  useEffect(() => {
    if (!enableRealtime) return;

    let intervalId;
    const video = document.querySelector('video');

    if (video) {
      intervalId = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          checkQualityDebounced(canvas);
        }
      }, 1000); // Check every second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enableRealtime, checkQualityDebounced]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    checkQuality,
    checkQualityDebounced
  };
};

export default usePhotoQuality;
