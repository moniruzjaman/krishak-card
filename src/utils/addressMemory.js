/**
 * Address Auto-Fill System
 * 
 * For sequential registrations within the same village, automatically retains
 * and pre-fills address hierarchies:
 * Division → District → Upazila → Union → Village → Mouza
 * 
 * Impact: Eliminates 6-8 dropdown selections per farmer in the same cluster.
 * With 200-400 farmers per village, this compounds to significant time savings.
 */

export class AddressMemory {
  constructor() {
    this.storageKey = 'krishak_address_memory_v2';
    this.maxHistory = 100;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.history = stored ? JSON.parse(stored) : [];
    } catch {
      this.history = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (e) {
      // Handle quota exceeded - remove oldest entries
      if (e.name === 'QuotaExceededError') {
        this.history = this.history.slice(0, Math.floor(this.maxHistory / 2));
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      }
    }
  }

  /**
   * Record address usage for intelligent defaults
   * @param {Object} address - { division, district, upazila, union, village, mouza }
   */
  recordAddress(address) {
    if (!address || !address.village) return;

    const key = this.createAddressKey(address);
    const existingIndex = this.history.findIndex(h => h.key === key);
    const now = Date.now();

    if (existingIndex >= 0) {
      // Update existing entry
      this.history[existingIndex].count++;
      this.history[existingIndex].lastUsed = now;
    } else {
      // Add new entry
      this.history.push({
        key,
        address: {
          division: address.division || '',
          district: address.district || '',
          upazila: address.upazila || '',
          union: address.union || '',
          village: address.village || '',
          mouza: address.mouza || ''
        },
        count: 1,
        firstUsed: now,
        lastUsed: now
      });
    }

    // Sort by combined score (frequency + recency)
    this.history.sort((a, b) => {
      const scoreA = this.calculateScore(a);
      const scoreB = this.calculateScore(b);
      return scoreB - scoreA;
    });

    // Keep only top entries
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }

    this.saveToStorage();
  }

  /**
   * Calculate relevance score for sorting
   */
  calculateScore(entry) {
    const daysSinceLastUse = (Date.now() - entry.lastUsed) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.max(0, 1 - daysSinceLastUse / 30); // Decay over 30 days
    const frequencyWeight = Math.log(entry.count + 1);
    return frequencyWeight * 0.7 + recencyWeight * 0.3;
  }

  /**
   * Get intelligent defaults for new registration
   * @param {string} currentVillage - Optional: current operating village
   * @returns {Object|null} Suggested address or null
   */
  getIntelligentDefaults(currentVillage = null) {
    if (!this.history.length) return null;

    // Priority 1: Exact village match
    if (currentVillage) {
      const villageMatch = this.history.find(h => 
        h.address.village?.toLowerCase() === currentVillage.toLowerCase()
      );
      if (villageMatch) {
        return {
          ...villageMatch.address,
          _source: 'village_match',
          _confidence: Math.min(1, villageMatch.count / 5)
        };
      }
    }

    // Priority 2: Most recently used full address
    const mostRecent = this.history[0];
    if (mostRecent) {
      return {
        ...mostRecent.address,
        _source: 'most_recent',
        _confidence: Math.min(1, mostRecent.count / 10)
      };
    }

    return null;
  }

  /**
   * Predict next field based on partial input
   * @param {Object} partial - Partially filled address { division, district, upazila, union }
   * @returns {Object|null} Predicted remaining fields
   */
  predictAddress(partial) {
    if (!this.history.length) return null;

    // Filter history by matching fields
    const matches = this.history.filter(h => {
      const addr = h.address;
      return (!partial.division || addr.division === partial.division) &&
             (!partial.district || addr.district === partial.district) &&
             (!partial.upazila || addr.upazila === partial.upazila) &&
             (!partial.union || addr.union === partial.union);
    });

    if (!matches.length) return null;

    // Predict remaining fields using weighted voting
    const predictions = {};
    const fields = ['union', 'village', 'mouza'];

    fields.forEach(field => {
      if (!partial[field]) {
        const voteCounts = {};

        matches.forEach(m => {
          const val = m.address[field];
          if (val) {
            if (!voteCounts[val]) {
              voteCounts[val] = { count: 0, score: 0 };
            }
            voteCounts[val].count += m.count;
            voteCounts[val].score += this.calculateScore(m);
          }
        });

        const sorted = Object.entries(voteCounts)
          .sort((a, b) => b[1].score - a[1].score);

        if (sorted.length > 0) {
          const [bestValue, data] = sorted[0];
          const totalScore = Object.values(voteCounts).reduce((s, v) => s + v.score, 0);
          predictions[field] = {
            value: bestValue,
            confidence: data.score / totalScore,
            alternatives: sorted.slice(1, 4).map(([v]) => v)
          };
        }
      }
    });

    return Object.keys(predictions).length > 0 ? predictions : null;
  }

  /**
   * Get frequently used villages for quick selection
   */
  getFrequentVillages(limit = 5) {
    return this.history
      .filter(h => h.address.village)
      .slice(0, limit)
      .map(h => ({
        village: h.address.village,
        union: h.address.union,
        upazila: h.address.upazila,
        count: h.count,
        fullAddress: h.address
      }));
  }

  /**
   * Get address statistics for dashboard
   */
  getStats() {
    const totalRegistrations = this.history.reduce((sum, h) => sum + h.count, 0);
    const uniqueVillages = new Set(this.history.map(h => h.address.village)).size;
    const uniqueUnions = new Set(this.history.map(h => h.address.union)).size;
    const uniqueDistricts = new Set(this.history.map(h => h.address.district)).size;

    // Calculate time saved estimate
    const avgDropdownsSaved = this.history.length > 0 ? 6 : 0;
    const totalTimeSaved = totalRegistrations * avgDropdownsSaved * 3; // 3 seconds per dropdown

    return { 
      totalRegistrations, 
      uniqueVillages, 
      uniqueUnions,
      uniqueDistricts,
      totalTimeSaved: Math.round(totalTimeSaved / 60), // minutes
      topVillage: this.history[0]?.address.village || null,
      entries: this.history.length
    };
  }

  /**
   * Clear all address history
   */
  clear() {
    this.history = [];
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export data for backup/transfer
   */
  exportData() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: this.history
    });
  }

  /**
   * Import data from another device
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.data && Array.isArray(imported.data)) {
        // Merge with existing, keeping higher counts
        imported.data.forEach(entry => {
          const existing = this.history.find(h => h.key === entry.key);
          if (existing) {
            existing.count = Math.max(existing.count, entry.count);
            existing.lastUsed = Math.max(existing.lastUsed, entry.lastUsed);
          } else {
            this.history.push(entry);
          }
        });

        this.history.sort((a, b) => this.calculateScore(b) - this.calculateScore(a));
        this.history = this.history.slice(0, this.maxHistory);
        this.saveToStorage();
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  createAddressKey(address) {
    return `${address.division || ''}|${address.district || ''}|${address.upazila || ''}|${address.union || ''}|${address.village || ''}`;
  }
}

export default AddressMemory;
