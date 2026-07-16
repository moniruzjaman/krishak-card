// Bangla Language Correction Layer — runs after raw OCR extraction, before
// the corrected value is trusted for auto-fill. Two components, applied in
// order (per plans/ocr-pipeline-v2-plan.md Phase 2):
//   1. Deterministic conjunct/matra repair — Tesseract frequently inserts a
//      stray space around a dependent vowel sign (matra) or the virama (্)
//      when it mis-segments a Bangla grapheme cluster into separate glyphs,
//      e.g. "ম হ ◌া ম ্ ম দ" instead of "মোহাম্মদ". These spaces are always
//      wrong — a matra or virama is never a legitimate word boundary — so
//      this step is a safe, generalizable regex pass, not a name-specific fix.
//   2. Fuzzy match against a common-name token dictionary (Levenshtein-based)
//      as a second pass for names the conjunct repair alone doesn't fully fix.
//
// NOTE: the bundled dictionary (src/data/commonBanglaNames.json) is a small
// starter seed. Swap in the Dirai-dataset-derived token list for real
// 95%+ coverage in production — see the plan doc for details.

import nameDictData from '../data/commonBanglaNames.json';

const NAME_TOKENS = nameDictData.tokens;

// Bangla dependent vowel signs (matras), virama, nukta, candrabindu, anusvara,
// visarga — none of these can legitimately stand with whitespace on either
// side; a space next to one of these almost always means Tesseract split a
// single character's components into separate "words".
const COMBINING_MARK_RANGE = '\u0981-\u0983\u09BC\u09BE-\u09CC\u09CD\u09D7';

export function repairFragmentedConjuncts(text) {
  if (!text) return text;
  let out = text;
  // Remove whitespace immediately before a combining mark/matra/virama
  out = out.replace(new RegExp(`\\s+(?=[${COMBINING_MARK_RANGE}])`, 'gu'), '');
  // Remove whitespace immediately after a combining mark/matra/virama
  out = out.replace(new RegExp(`([${COMBINING_MARK_RANGE}])\\s+`, 'gu'), '$1');
  // Collapse any remaining runs of whitespace
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length, 1);
}

/** Best fuzzy match for a single name token against the common-name dictionary. */
export function fuzzyMatchToken(token, dictionary = NAME_TOKENS) {
  let best = null, bestScore = -1;
  for (const candidate of dictionary) {
    const score = similarity(token, candidate);
    if (score > bestScore) { bestScore = score; best = candidate; }
  }
  return { match: best, score: bestScore };
}

const FUZZY_ACCEPT_THRESHOLD = 0.72;

/**
 * Correct a raw OCR'd name: conjunct repair, then per-token fuzzy matching
 * against the common-name dictionary. Returns the corrected string plus a
 * 0-100 confidence score (fed into the confidence-based editing UI).
 */
export function correctAndScoreName(rawName) {
  if (!rawName || !rawName.trim()) return { corrected: rawName || '', confidence: 0 };

  const repaired = repairFragmentedConjuncts(rawName);
  const tokens = repaired.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { corrected: repaired, confidence: 0 };

  const correctedTokens = [];
  const tokenScores = [];

  for (const token of tokens) {
    if (token.length <= 1) {
      // Too short to fuzzy-match reliably (e.g. a stray punctuation glyph) — pass through
      correctedTokens.push(token);
      tokenScores.push(0.5);
      continue;
    }
    const { match, score } = fuzzyMatchToken(token);
    if (score >= FUZZY_ACCEPT_THRESHOLD) {
      correctedTokens.push(match);
      tokenScores.push(score);
    } else {
      // No confident dictionary match — keep the OCR's own text, but the low
      // score will correctly push this field toward the yellow/red bucket
      // for manual review rather than silently trusting an unmatched token.
      correctedTokens.push(token);
      tokenScores.push(score);
    }
  }

  const avgScore = tokenScores.reduce((a, b) => a + b, 0) / tokenScores.length;
  return {
    corrected: correctedTokens.join(' '),
    confidence: Math.round(avgScore * 100),
  };
}
