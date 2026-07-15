/**
 * Intelligent Defaults System
 * 
 * Auto-populates commonly repeated fields based on the most recent entry:
 * - Farmer Type (Small/Marginal/Medium/Large)
 * - Education Level
 * - Primary Occupation
 * - Benefit Status
 * 
 * Rationale: In homogeneous agricultural communities, consecutive farmers
 * typically share similar demographic profiles. Intelligent defaults capitalize
 * on this statistical clustering.
 */

export class IntelligentDefaults {
  constructor() {
    this.storageKey = 'krishak_defaults_memory_v2';
    this.maxHistory = 200;
    this.minConfidence = 0.65; // Minimum confidence to auto-fill
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.patterns = stored ? JSON.parse(stored) : this.getInitialPatterns();
    } catch {
      this.patterns = this.getInitialPatterns();
    }
  }

  getInitialPatterns() {
    return {
      farmerType: {},
      educationLevel: {},
      primaryOccupation: {},
      benefitStatus: {},
      gender: {},
      maritalStatus: {},
      landOwnership: {}
    };
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.patterns));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Reduce history for each field
        Object.keys(this.patterns).forEach(field => {
          const entries = Object.entries(this.patterns[field]);
          if (entries.length > 50) {
            const sorted = entries.sort((a, b) => b[1].count - a[1].count);
            this.patterns[field] = Object.fromEntries(sorted.slice(0, 50));
          }
        });
        localStorage.setItem(this.storageKey, JSON.stringify(this.patterns));
      }
    }
  }

  /**
   * Learn from completed registration
   * @param {Object} registrationData - Full registration form data
   */
  learn(registrationData) {
    const fields = [
      'farmerType', 'educationLevel', 'primaryOccupation', 
      'benefitStatus', 'gender', 'maritalStatus', 'landOwnership'
    ];

    const now = Date.now();

    fields.forEach(field => {
      const value = registrationData[field];
      if (!value || value === '' || value === 'select') return;

      if (!this.patterns[field]) {
        this.patterns[field] = {};
      }

      if (!this.patterns[field][value]) {
        this.patterns[field][value] = {
          count: 0,
          firstSeen: now,
          lastUsed: now,
          streak: 0 // Consecutive occurrences
        };
      }

      const entry = this.patterns[field][value];
      entry.count++;
      entry.lastUsed = now;
      entry.streak++;

      // Decrease streak for other values in same field
      Object.entries(this.patterns[field]).forEach(([k, v]) => {
        if (k !== value) {
          v.streak = Math.max(0, v.streak - 1);
        }
      });
    });

    this.saveToStorage();
  }

  /**
   * Get suggested defaults for new form
   * @returns {Object} Default values with confidence scores
   */
  getDefaults() {
    const defaults = {};

    for (const [field, values] of Object.entries(this.patterns)) {
      const entries = Object.entries(values);
      if (entries.length === 0) continue;

      // Sort by combined score (count + recency + streak)
      const scored = entries.map(([value, data]) => {
        const daysSinceUse = (Date.now() - data.lastUsed) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - daysSinceUse / 7); // 7-day decay
        const streakBonus = Math.min(data.streak / 5, 0.3); // Max 0.3 bonus
        const frequencyScore = Math.log(data.count + 1);

        const totalScore = frequencyScore * 0.5 + recencyScore * 0.3 + streakBonus * 0.2;

        return { value, score: totalScore, count: data.count, streak: data.streak };
      });

      scored.sort((a, b) => b.score - a.score);
      const [topEntry] = scored;

      if (!topEntry) continue;

      // Calculate confidence
      const totalCount = entries.reduce((sum, [, d]) => sum + d.count, 0);
      const confidence = topEntry.count / totalCount;
      const adjustedConfidence = confidence * (0.7 + topEntry.streak * 0.1);

      defaults[field] = {
        value: topEntry.value,
        confidence: Math.min(adjustedConfidence, 0.99),
        autoFill: adjustedConfidence > this.minConfidence,
        streak: topEntry.streak,
        totalUses: topEntry.count,
        alternatives: scored.slice(1, 3).map(s => s.value)
      };
    }

    return defaults;
  }

  /**
   * Get confidence score for a specific field value
   */
  getFieldConfidence(field, value) {
    if (!this.patterns[field] || !this.patterns[field][value]) {
      return 0;
    }

    const data = this.patterns[field][value];
    const total = Object.values(this.patterns[field]).reduce((a, b) => a + b.count, 0);
    return data.count / total;
  }

  /**
   * Check if a field should be auto-filled
   */
  shouldAutoFill(field) {
    const defaults = this.getDefaults();
    return defaults[field]?.autoFill || false;
  }

  /**
   * Get all statistics for dashboard
   */
  getStats() {
    const defaults = this.getDefaults();
    const autoFillable = Object.values(defaults).filter(d => d.autoFill).length;
    const totalFields = Object.keys(this.patterns).length;

    // Calculate patterns learned
    const totalPatterns = Object.values(this.patterns).reduce(
      (sum, field) => sum + Object.keys(field).length, 0
    );

    // Estimate time saved (3 seconds per auto-filled field)
    const avgAutoFilled = autoFillable;
    const totalRegistrations = Object.values(this.patterns).reduce((sum, field) => {
      return sum + Object.values(field).reduce((s, d) => s + d.count, 0);
    }, 0) / Math.max(Object.keys(this.patterns).length, 1);

    return {
      autoFillable,
      totalFields,
      totalPatterns,
      avgAutoFilled,
      totalRegistrations: Math.round(totalRegistrations),
      timeSavedPerRegistration: avgAutoFilled * 3, // seconds
      topPatterns: Object.entries(defaults)
        .filter(([, d]) => d.autoFill)
        .map(([field, data]) => ({
          field,
          value: data.value,
          confidence: data.confidence,
          streak: data.streak
        }))
    };
  }

  /**
   * Reset learning for a specific field
   */
  resetField(field) {
    if (this.patterns[field]) {
      this.patterns[field] = {};
      this.saveToStorage();
    }
  }

  /**
   * Clear all learned patterns
   */
  clear() {
    this.patterns = this.getInitialPatterns();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export learned patterns
   */
  exportData() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      patterns: this.patterns
    });
  }

  /**
   * Import patterns from another device
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.patterns) {
        // Merge patterns, keeping higher counts
        Object.entries(imported.patterns).forEach(([field, values]) => {
          if (!this.patterns[field]) this.patterns[field] = {};

          Object.entries(values).forEach(([value, data]) => {
            if (this.patterns[field][value]) {
              this.patterns[field][value].count += data.count;
              this.patterns[field][value].lastUsed = Math.max(
                this.patterns[field][value].lastUsed,
                data.lastUsed
              );
            } else {
              this.patterns[field][value] = data;
            }
          });
        });

        this.saveToStorage();
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}

export default IntelligentDefaults;
