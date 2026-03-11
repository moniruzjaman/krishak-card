/**
 * Vercel Serverless Function — DAM Market Price Proxy
 * Fetches from market.dam.gov.bd and returns structured commodity prices.
 * Handles CORS and caches for 30 mins via Vercel Edge Cache headers.
 *
 * GET /api/market-prices?district=Dhaka
 */

// Commodity name mapping BN→EN
const COMMODITY_MAP = {
  "মোটা চাল": { en: "Coarse Rice", category: "ধান/চাল" },
  "মাঝারি চাল": { en: "Medium Rice", category: "ধান/চাল" },
  "সরু চাল": { en: "Fine Rice", category: "ধান/চাল" },
  "আটা": { en: "Flour", category: "গম" },
  "আলু": { en: "Potato", category: "সবজি" },
  "পেঁয়াজ": { en: "Onion", category: "সবজি" },
  "রসুন": { en: "Garlic", category: "সবজি" },
  "মসুর ডাল": { en: "Lentil", category: "ডাল" },
  "মুগ ডাল": { en: "Mung Dal", category: "ডাল" },
  "সয়াবিন তেল": { en: "Soybean Oil", category: "তেল" },
  "পাম তেল": { en: "Palm Oil", category: "তেল" },
  "ব্রয়লার মুরগি": { en: "Broiler Chicken", category: "মাংস" },
  "গরুর মাংস": { en: "Beef", category: "মাংস" },
  "ইলিশ মাছ": { en: "Hilsha Fish", category: "মাছ" },
  "রুই মাছ": { en: "Rui Fish", category: "মাছ" },
  "চিনি": { en: "Sugar", category: "অন্যান্য" },
  "লবণ": { en: "Salt", category: "অন্যান্য" },
  "কলা": { en: "Banana", category: "ফল" },
  "টমেটো": { en: "Tomato", category: "সবজি" },
  "বেগুন": { en: "Brinjal", category: "সবজি" },
};

// Fallback prices (BDT/kg) when DAM is unreachable — sourced from recent DAM reports
const FALLBACK_PRICES = [
  { nameBn: "মোটা চাল",    nameEn: "Coarse Rice",    unit: "কেজি", min: 52,  max: 56,  category: "ধান/চাল" },
  { nameBn: "সরু চাল",     nameEn: "Fine Rice",      unit: "কেজি", min: 68,  max: 75,  category: "ধান/চাল" },
  { nameBn: "আলু",         nameEn: "Potato",         unit: "কেজি", min: 28,  max: 35,  category: "সবজি" },
  { nameBn: "পেঁয়াজ",     nameEn: "Onion",          unit: "কেজি", min: 55,  max: 70,  category: "সবজি" },
  { nameBn: "মসুর ডাল",   nameEn: "Lentil",         unit: "কেজি", min: 110, max: 130, category: "ডাল" },
  { nameBn: "সয়াবিন তেল", nameEn: "Soybean Oil",   unit: "লিটার", min: 155, max: 168, category: "তেল" },
  { nameBn: "ব্রয়লার মুরগি", nameEn: "Broiler",    unit: "কেজি", min: 170, max: 195, category: "মাংস" },
  { nameBn: "ইলিশ মাছ",   nameEn: "Hilsha Fish",   unit: "কেজি", min: 1200,max: 1600, category: "মাছ" },
  { nameBn: "রুই মাছ",    nameEn: "Rui Fish",       unit: "কেজি", min: 280, max: 350, category: "মাছ" },
  { nameBn: "টমেটো",      nameEn: "Tomato",         unit: "কেজি", min: 40,  max: 60,  category: "সবজি" },
  { nameBn: "কলা",        nameEn: "Banana",         unit: "ডজন", min: 60,  max: 90,  category: "ফল" },
  { nameBn: "চিনি",       nameEn: "Sugar",          unit: "কেজি", min: 118, max: 128, category: "অন্যান্য" },
  { nameBn: "গরুর মাংস",  nameEn: "Beef",           unit: "কেজি", min: 680, max: 750, category: "মাংস" },
  { nameBn: "আটা",        nameEn: "Wheat Flour",    unit: "কেজি", min: 48,  max: 55,  category: "গম" },
  { nameBn: "বেগুন",      nameEn: "Brinjal",        unit: "কেজি", min: 40,  max: 70,  category: "সবজি" },
  { nameBn: "মুগ ডাল",   nameEn: "Mung Dal",       unit: "কেজি", min: 130, max: 155, category: "ডাল" },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Cache for 30 minutes on Vercel Edge
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const district = req.query.district || "Dhaka";
  const today = new Date().toLocaleDateString("en-GB");

  try {
    // Attempt to fetch from DAM's public price table
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const damRes = await fetch(
      "https://market.dam.gov.bd/damweb/PublicPortal/MarketDisplayFullScreen.php",
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; KrishokCard/1.0; +https://krishak-card.vercel.app)",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "bn-BD,bn;q=0.9,en;q=0.8",
        },
      }
    );
    clearTimeout(timeout);

    if (!damRes.ok) throw new Error(`DAM returned ${damRes.status}`);

    const html = await damRes.text();

    // Parse table rows — DAM table has: Commodity | Type | Unit | Dhaka | Ctg | Khulna | Rajshahi | Rangpur | Sylhet | Barisal
    const colMap = { Dhaka: 3, Chittagong: 4, Khulna: 5, Rajshahi: 6, Rangpur: 7, Sylhet: 8, Barisal: 9 };
    const colIdx = colMap[district] ?? 3;

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const prices = [];

    let rowMatch;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const cells = [];
      let cellMatch;
      const cellContent = rowMatch[1];
      const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      while ((cellMatch = cellRe.exec(cellContent)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }
      if (cells.length >= colIdx + 1 && cells[0] && cells[colIdx]) {
        const nameBn = cells[0];
        const priceStr = cells[colIdx].replace(/[^\d-–]/g, "");
        const parts = priceStr.split(/[-–]/);
        const min = parseInt(parts[0]) || 0;
        const max = parseInt(parts[1] || parts[0]) || min;
        const meta = COMMODITY_MAP[nameBn] || {};
        if (min > 0) {
          prices.push({
            nameBn,
            nameEn: meta.en || nameBn,
            unit: cells[2] || "কেজি",
            min,
            max,
            category: meta.category || "অন্যান্য",
            district,
          });
        }
      }
    }

    if (prices.length < 5) throw new Error("Parsed too few prices — likely parse failure");

    return res.status(200).json({
      source: "live",
      sourceUrl: "https://market.dam.gov.bd",
      date: today,
      district,
      prices,
    });

  } catch (err) {
    console.warn("DAM fetch failed, using fallback:", err.message);

    // Return fallback with realistic prices
    return res.status(200).json({
      source: "fallback",
      sourceUrl: "https://market.dam.gov.bd",
      date: today,
      district,
      note: "DAM সার্ভার সাময়িক অনুপলব্ধ। সর্বশেষ পরিচিত মূল্য দেখানো হচ্ছে।",
      prices: FALLBACK_PRICES.map(p => ({ ...p, district })),
    });
  }
}
