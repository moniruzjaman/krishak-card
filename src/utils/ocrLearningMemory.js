/**
 * OCR Learning Memory System
 * 
 * Local adaptive correction dictionary that learns from repeated SAAO corrections:
 * - Detects recurring correction patterns (e.g., specific village name misread)
 * - Stores correct mapping in local on-device database
 * - Auto-applies corrections for future occurrences without user intervention
 * 
 * Benefit: Continuously improving system that becomes more accurate with each 
 * registration in a given locality.
 */

export class OCRLearningMemory {
  constructor() {
    this.storageKey = 'krishak_ocr_memory_v2';
    this.maxEntries = 2000;
    this.minOccurrences = 3;        // Minimum corrections before auto-applying
    this.confidenceThreshold = 0.85; // Minimum consistency for auto-apply
    this.streakThreshold = 2;       // Consecutive corrections boost confidence
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.corrections = stored ? JSON.parse(stored) : {};
    } catch {
      this.corrections = {};
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.corrections));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this.cleanup(0.5); // Remove 50% of entries
        localStorage.setItem(this.storageKey, JSON.stringify(this.corrections));
      }
    }
  }

  /**
   * Record a correction made by SAAO officer
   * @param {string} ocrText - Original OCR output
   * @param {string} correctedText - User's correction
   * @param {string} fieldType - Type of field (name, address, etc.)
   * @param {Object} context - Additional context (village, date, etc.)
   */
  recordCorrection(ocrText, correctedText, fieldType, context = {}) {
    if (!ocrText || !correctedText || ocrText === correctedText) return;

    const key = this.createKey(ocrText, fieldType);
    const now = Date.now();

    if (!this.corrections[key]) {
      this.corrections[key] = {
        ocrText,
        fieldType,
        corrections: {},
        context: {
          villages: new Set(),
          firstSeen: now,
          lastUsed: now
        },
        totalCorrections: 0
      };
    }

    const entry = this.corrections[key];

    // Store the correction
    if (!entry.corrections[correctedText]) {
      entry.corrections[correctedText] = {
        count: 0,
        firstUsed: now,
        lastUsed: now,
        streak: 0,          // Consecutive uses
        confidence: 0       // Calculated confidence
      };
    }

    const correction = entry.corrections[correctedText];
    correction.count++;
    correction.lastUsed = now;
    correction.streak++;
    entry.totalCorrections++;
    entry.context.lastUsed = now;

    // Decrease streak for other corrections
    Object.entries(entry.corrections).forEach(([text, data]) => {
      if (text !== correctedText) {
        data.streak = Math.max(0, data.streak - 1);
      }
    });

    // Update context
    if (context.village) {
      entry.context.villages = [...new Set([...entry.context.villages, context.village])];
    }

    // Recalculate confidence for all corrections
    this.recalculateConfidence(entry);

    // Cleanup if needed
    if (Object.keys(this.corrections).length > this.maxEntries) {
      this.cleanup();
    }

    this.saveToStorage();
  }

  /**
   * Check if we have a learned correction for this OCR output
   * @param {string} ocrText - Raw OCR text
   * @param {string} fieldType - Field type
   * @returns {Object|null} Correction data or null
   */
  getCorrection(ocrText, fieldType) {
    const key = this.createKey(ocrText, fieldType);
    const entry = this.corrections[key];

    if (!entry) return null;

    // Find most frequent correction
    const corrections = Object.entries(entry.corrections);
    if (!corrections.length) return null;

    // Sort by confidence (not just count)
    const sorted = corrections.sort((a, b) => b[1].confidence - a[1].confidence);
    const [bestCorrection, data] = sorted[0];

    // Not enough occurrences yet - suggest but don't auto-apply
    if (data.count < this.minOccurrences) {
      return {
        type: 'suggestion',
        correction: bestCorrection,
        confidence: data.confidence,
        occurrences: data.count,
        needs: this.minOccurrences - data.count,
        message: `Need ${this.minOccurrences - data.count} more corrections to auto-apply`
      };
    }

    // Check if confidence meets threshold
    const autoApply = data.confidence >= this.confidenceThreshold;

    return {
      type: autoApply ? 'auto' : 'suggestion',
      correction: bestCorrection,
      confidence: data.confidence,
      occurrences: data.count,
      streak: data.streak,
      autoApply,
      message: autoApply 
        ? 'Auto-applied based on previous corrections'
        : 'Suggested based on previous corrections'
    };
  }

  /**
   * Batch check multiple OCR results for learned corrections
   */
  batchCheck(ocrResults) {
    return ocrResults.map(field => {
      const learned = this.getCorrection(field.value, field.type);

      if (learned?.autoApply) {
        return {
          ...field,
          value: learned.correction,
          originalValue: field.value,
          confidence: Math.min(learned.confidence * 1.1, 0.99), // Boost confidence
          source: 'learned_auto',
          learnedInfo: learned
        };
      }

      if (learned?.type === 'suggestion') {
        return {
          ...field,
          suggestions: [
            ...(field.suggestions || []),
            { word: learned.correction, confidence: learned.confidence, source: 'learned' }
          ],
          learnedInfo: learned
        };
      }

      return field;
    });
  }

  /**
   * Recalculate confidence based on multiple factors
   */
  recalculateConfidence(entry) {
    const totalCorrections = entry.totalCorrections;

    Object.values(entry.corrections).forEach(data => {
      // Base confidence from frequency
      const frequencyConfidence = data.count / totalCorrections;

      // Streak bonus (consecutive corrections are more reliable)
      const streakBonus = Math.min(data.streak / 5, 0.2);

      // Recency factor (recent corrections weighted more)
      const daysSinceLastUse = (Date.now() - data.lastUsed) / (1000 * 60 * 60 * 24);
      const recencyFactor = Math.max(0.5, 1 - daysSinceLastUse / 30);

      // Minimum threshold factor (more corrections = more reliable)
      const thresholdFactor = Math.min(data.count / this.minOccurrences, 1);

      // Combined confidence
      data.confidence = Math.min(0.99, 
        (frequencyConfidence * 0.5 + streakBonus + recencyFactor * 0.3) * thresholdFactor
      );
    });
  }

  /**
   * Detect recurring patterns across all corrections
   */
  getRecurringPatterns(minOccurrences = 5) {
    const patterns = [];

    for (const [key, entry] of Object.entries(this.corrections)) {
      for (const [correction, data] of Object.entries(entry.corrections)) {
        if (data.count >= minOccurrences) {
          patterns.push({
            ocrPattern: entry.ocrText,
            correctedTo: correction,
            occurrences: data.count,
            fieldType: entry.fieldType,
            confidence: data.confidence,
            villages: entry.context.villages,
            streak: data.streak,
            lastUsed: data.lastUsed
          });
        }
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get patterns specific to a village
   */
  getVillagePatterns(village, minOccurrences = 3) {
    const patterns = [];

    for (const [key, entry] of Object.entries(this.corrections)) {
      if (!entry.context.villages.includes(village)) continue;

      for (const [correction, data] of Object.entries(entry.corrections)) {
        if (data.count >= minOccurrences) {
          patterns.push({
            ocrPattern: entry.ocrText,
            correctedTo: correction,
            occurrences: data.count,
            confidence: data.confidence
          });
        }
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get statistics for dashboard
   */
  getStats() {
    const totalPatterns = Object.keys(this.corrections).length;

    let autoApplicable = 0;
    let totalCorrections = 0;
    let activePatterns = 0;

    Object.values(this.corrections).forEach(entry => {
      Object.values(entry.corrections).forEach(data => {
        totalCorrections += data.count;
        if (data.count >= this.minOccurrences && data.confidence >= this.confidenceThreshold) {
          autoApplicable++;
        }
        if (data.count >= 2) {
          activePatterns++;
        }
      });
    });

    // Calculate impact metrics
    const avgCorrectionsPerPattern = totalPatterns > 0 ? totalCorrections / totalPatterns : 0;
    const autoApplyRate = totalPatterns > 0 ? autoApplicable / totalPatterns : 0;

    return { 
      totalPatterns, 
      autoApplicable, 
      activePatterns,
      totalCorrections,
      avgCorrectionsPerPattern: Math.round(avgCorrectionsPerPattern * 10) / 10,
      autoApplyRate: Math.round(autoApplyRate * 100),
      topPatterns: this.getRecurringPatterns(5).slice(0, 5)
    };
  }

  /**
   * Get learning progress for a specific field
   */
  getFieldProgress(fieldType) {
    const fieldCorrections = Object.values(this.corrections)
      .filter(entry => entry.fieldType === fieldType);

    const total = fieldCorrections.length;
    const learned = fieldCorrections.filter(entry => 
      Object.values(entry.corrections).some(d => 
        d.count >= this.minOccurrences && d.confidence >= this.confidenceThreshold
      )
    ).length;

    return {
      total,
      learned,
      progress: total > 0 ? Math.round((learned / total) * 100) : 0
    };
  }

  /**
   * Cleanup old/less useful entries
   */
  cleanup(ratio = 0.3) {
    const entries = Object.entries(this.corrections);

    // Sort by usefulness score
    entries.sort((a, b) => {
      const scoreA = this.calculateUsefulness(a[1]);
      const scoreB = this.calculateUsefulness(b[1]);
      return scoreA - scoreB;
    });

    // Remove bottom entries
    const removeCount = Math.floor(entries.length * ratio);
    for (let i = 0; i < removeCount; i++) {
      delete this.corrections[entries[i][0]];
    }
  }

  calculateUsefulness(entry) {
    const maxCount = Math.max(...Object.values(entry.corrections).map(d => d.count));
    const daysSinceUse = (Date.now() - entry.context.lastUsed) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 1 - daysSinceUse / 90); // 90-day decay
    return maxCount * recency;
  }

  /**
   * Clear all learned patterns
   */
  clear() {
    this.corrections = {};
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export data for backup/sync
   */
  exportData() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      corrections: this.corrections,
      stats: this.getStats()
    });
  }

  /**
   * Import data from another device/officer
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.corrections) {
        // Merge corrections intelligently
        Object.entries(imported.corrections).forEach(([key, entry]) => {
          if (this.corrections[key]) {
            // Merge correction options
            Object.entries(entry.corrections).forEach(([text, data]) => {
              if (this.corrections[key].corrections[text]) {
                this.corrections[key].corrections[text].count += data.count;
                this.corrections[key].corrections[text].lastUsed = Math.max(
                  this.corrections[key].corrections[text].lastUsed,
                  data.lastUsed
                );
              } else {
                this.corrections[key].corrections[text] = data;
              }
            });

            // Merge context
            if (entry.context.villages) {
              this.corrections[key].context.villages = [
                ...new Set([
                  ...this.corrections[key].context.villages,
                  ...entry.context.villages
                ])
              ];
            }
          } else {
            this.corrections[key] = entry;
          }
        });

        // Recalculate all confidences
        Object.values(this.corrections).forEach(entry => this.recalculateConfidence(entry));

        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error('Failed to import OCR memory:', e);
      return false;
    }
    return false;
  }

  createKey(ocrText, fieldType) {
    // Normalize key for consistent matching
    const normalized = ocrText
      .replace(/\s+/g, '')
      .replace(/[◌\u200C\u200D]/g, '')
      .toLowerCase();
    return `${fieldType}:${normalized}`;
  }
}

export default OCRLearningMemory;
