// OCR Confidence-Based Editing — replaces the old all-or-nothing model.
// For each structured field (name, nid, dob, address parts) we find the best
// matching run of Tesseract's own word-level output and combine two signals:
//   - Tesseract's own per-word confidence (0-100) for that run
//   - string-similarity between the field value and that OCR run (post
//     Bangla-correction), so a value the LLM invented/hallucinated with no
//     real OCR support scores low even if Tesseract was "confident" about
//     unrelated words on the card.
// The combined score is bucketed per the exact thresholds requested:
//   > 95%  -> green  (auto-accept)
//   80-95% -> yellow (quick visual verification)
//   < 80%  -> red    (manual correction required)

import { levenshtein } from './banglaTextCorrection';

export const CONFIDENCE_THRESHOLDS = { GREEN: 95, YELLOW: 80 };

export function getConfidenceLevel(score) {
  if (score == null) return null;
  if (score > CONFIDENCE_THRESHOLDS.GREEN) return 'green';
  if (score >= CONFIDENCE_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

function normalize(s) {
  return (s || '').toString().replace(/\s+/g, '').toLowerCase();
}

function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length, 1);
}

/**
 * Find the best-matching contiguous run of OCR words for a given field value,
 * trying run lengths from 1 up to a generous cap, and return
 * { similarity (0-1), avgConfidence (0-100) } for the best run found.
 */
function bestRunMatch(fieldValue, ocrWords) {
  const target = normalize(fieldValue);
  if (!target || !ocrWords || ocrWords.length === 0) {
    return { similarity: 0, avgConfidence: 0 };
  }

  const maxRun = Math.min(ocrWords.length, 8);
  let best = { similarity: 0, avgConfidence: 0 };

  for (let runLen = 1; runLen <= maxRun; runLen++) {
    for (let start = 0; start + runLen <= ocrWords.length; start++) {
      const run = ocrWords.slice(start, start + runLen);
      const runText = normalize(run.map((w) => w.text).join(''));
      if (!runText) continue;
      const sim = similarity(target, runText);
      if (sim > best.similarity) {
        const avgConf = run.reduce((s, w) => s + (w.confidence ?? 0), 0) / run.length;
        best = { similarity: sim, avgConfidence: avgConf };
      }
    }
  }
  return best;
}

/**
 * Score every field in `fields` (a flat { key: value } map — nested address
 * fields should be flattened by the caller first) against the raw Tesseract
 * word list. Returns { [key]: scoreOutOf100 }.
 */
export function scoreOcrFields(fields, ocrWords) {
  const scores = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    const { similarity: sim, avgConfidence } = bestRunMatch(value, ocrWords);
    // Weighted blend: string-match strength matters slightly more than raw
    // OCR confidence, since a wrong-but-clearly-printed word can still get a
    // high Tesseract confidence score.
    const combined = sim * 0.6 * 100 + avgConfidence * 0.4;
    scores[key] = Math.round(Math.min(100, Math.max(0, combined)));
  }
  return scores;
}
