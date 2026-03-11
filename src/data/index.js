// ─── Farmer profile (demo) — all 33 fields from DAE Electronic Profile ────────
export const FARMER = {
  // ── Identity (Fields 01–10) ──────────────────────────────────────────────
  name: "Md. Abul Rahman",
  nameBn: "মোঃ আবুল রহমান",
  guardianName: "মোঃ আব্দুল করিম (পিতা)",
  gender: "পুরুষ",
  address: {
    division: "ঢাকা", district: "মুন্সীগঞ্জ", upazila: "সিরাজদিখান",
    union: "রাজানগর", block: "ব্লক-০৩", village: "পূর্বগ্রাম",
  },
  nid: "19**-****-3241",
  dob: "১৫ মার্চ ১৯৭৮",
  age: "৪৭",
  education: "মাধ্যমিক (SSC)",
  otherOccupation: "না",
  mobile: "017**-***678",
  // ── Family & Geography (Fields 11–12) ────────────────────────────────────
  familyMembers: "৫",
  gps: "23.5204° N, 90.4272° E",
  // ── Land (Fields 13–20) ──────────────────────────────────────────────────
  totalLand: "১৮৭",
  landOwnership: { mouza: "রাজানগর", dag: "৪৫২, ৪৫৩", khatian: "২১৮" },
  cultivableLand: "১৬৫",
  category: "Small Farmer",
  categoryBn: "ক্ষুদ্র কৃষক",
  sharecropTaken: "৩০",
  sharecropGiven: "০",
  crops: { robi: "সরিষা, মসুর ডাল", kharif1: "আউশ ধান, পাট", kharif2: "আমন ধান, কলা" },
  orchard: "২৫ শতাংশ",
  // ── Inputs & Finance (Fields 21–27) ─────────────────────────────────────
  fertilizers: "ইউরিয়া, টিএসপি, এমওপি, জৈব সার",
  seedSource: "BADC ও স্থানীয় বাজার",
  irrigationType: "অগভীর নলকূপ (STW)",
  incentive: "২০২৪-২৫ রবি মৌসুম",
  loan: "৳ 25,000 (মৌসুমী)",
  insurance: "শস্য বীমা (ধান)",
  warehouse: "হ্যাঁ — উপজেলা গুদাম",
  // ── Fisheries & Livestock (Fields 28–31) ─────────────────────────────────
  pondCount: "২",
  pondArea: "৪৫ শতাংশ",
  fishArea: "৪০ শতাংশ",
  livestock: "২টি গরু, ৫টি ছাগল",
  farmCount: "১",
  // ── Verification (Fields 32–33) ──────────────────────────────────────────
  signatureVerified: true,
  biometricVerified: true,
  // ── Card meta ────────────────────────────────────────────────────────────
  cardNo: "1234 5678 9017",
  validThru: "01/28",
  uniqueId: "KC-DAE-2025-04523",
  issuedBy: "কৃষি সম্প্রসারণ অধিদপ্তর (DAE)",
  tagline: "স্বপ্ন নয় বাস্তবতা এক সঙ্গে",
  balance: "৳ 12,450",
  loanDue: "৳ 8,200",
  subsidyBalance: "৳ 4,800",
  district: "Munshiganj",
  division: "Dhaka",
  upazila: "Sirajdikhan",
  land: "187",
  phone: "017**-***678",
};

// ─── Pilot locations from concept paper ──────────────────────────────────────
export const PILOT_SITES = [
  { division: "Dhaka", district: "Munshiganj", upazila: "Sirajdikhan", crop: "Banana / কলা" },
  { division: "Rajshahi", district: "Bogura", upazila: "Shibganj", crop: "Potato & Banana / আলু ও কলা" },
  { division: "Rangpur", district: "Rangpur", upazila: "Mithapukur", crop: "Mango & Vegetables / আম ও সবজি" },
  { division: "Mymensingh", district: "Jamalpur", upazila: "Islampur", crop: "Maize & Chili / ভুট্টা ও মরিচ" },
  { division: "Khulna", district: "Jashore", upazila: "Jhikargacha", crop: "Nursery / নার্সারি" },
  { division: "Barisal", district: "Pirojpur", upazila: "Nazirabad", crop: "Guava / পেয়ারা" },
  { division: "Sylhet", district: "Moulvibazar", upazila: "Juuri", crop: "Orange / কমলা" },
  { division: "Chattogram", district: "Cox's Bazar", upazila: "Teknaf", crop: "Dried Fish / শুটকী মাছ" },
];

// ─── Registered crops ─────────────────────────────────────────────────────────
export const CROPS = [
  { name: "Banana", bn: "কলা", upazila: "Sirajdikhan", season: "Kharif-1", yieldEst: 28.4, status: "healthy", land: "45 dec", fertilizer: "Applied", irrigation: "Drip", pestRisk: "Low", insurance: "Active", loan: "Linked", marketPrice: "৳ 42/kg" },
  { name: "Potato", bn: "আলু", upazila: "Shibganj", season: "Rabi", yieldEst: 22.1, status: "alert", land: "60 dec", fertilizer: "Pending", irrigation: "Sprinkler", pestRisk: "High", insurance: "Active", loan: "None", marketPrice: "৳ 28/kg" },
  { name: "Mango", bn: "আম", upazila: "Mithapukur", season: "Kharif-2", yieldEst: 18.7, status: "healthy", land: "30 dec", fertilizer: "Applied", irrigation: "Flood", pestRisk: "Low", insurance: "Active", loan: "Linked", marketPrice: "৳ 85/kg" },
  { name: "Maize", bn: "ভুট্টা", upazila: "Islampur", season: "Rabi", yieldEst: 31.2, status: "healthy", land: "52 dec", fertilizer: "Applied", irrigation: "Flood", pestRisk: "Low", insurance: "Pending", loan: "Linked", marketPrice: "৳ 32/kg" },
];

// ─── Services — complete list from DAE Concept Paper (all 11 services) ─────────
// Source: "কৃষক কার্ডের মাধ্যমে প্রাপ্ত সেবার তালিকা" (pages 3–4 of concept paper)
export const SERVICES = [
  {
    icon: "💰",
    label: "সরকারি ভর্তুকি ও সহায়তা",
    labelEn: "Gov't Subsidy & Support",
    color: "#16a34a",
    accent: "rgba(22,163,74,0.12)",
    // Direct quote from PDF: "কৃষক কার্ডের মাধ্যমে কৃষকরা সরকারি ভর্তুকিসহ কৃষি প্রণোদনা ও পুনর্বাসন সহায়তা নিতে পারবেন"
    descBn: "কার্ডের মাধ্যমে সরকারি ভর্তুকি, কৃষি প্রণোদনা ও পুনর্বাসন সহায়তা সরাসরি কৃষকের কাছে পৌঁছাবে।",
    descEn: "Fertilizer, seed & irrigation subsidies plus rehabilitation aid delivered directly — no middlemen.",
    details: ["সার ভর্তুকি", "বীজ প্রণোদনা", "পুনর্বাসন সহায়তা", "কৃষি উপকরণ ভর্তুকি"],
  },
  {
    icon: "🏦",
    label: "সহজে কৃষি ঋণ প্রাপ্তি",
    labelEn: "Easy Agricultural Loan",
    color: "#0284c7",
    accent: "rgba(2,132,199,0.12)",
    // PDF: "কৃষক কার্ডের মাধ্যমে কৃষকরা সহজে এবং কম সুদে ঋণ নিতে পারবেন"
    descBn: "কৃষক কার্ডের মাধ্যমে সহজে ও কম সুদে মৌসুমী ও মেয়াদী ঋণ নেওয়া যাবে।",
    descEn: "Low-interest seasonal and term loans — accessible directly through the card, bypassing local moneylenders.",
    details: ["মৌসুমী ঋণ", "মেয়াদী ঋণ", "স্বল্প সুদ", "ব্যাংক সংযোগ"],
  },
  {
    icon: "🌱",
    label: "কৃষি উপকরণ ক্রয়ে সহায়তা",
    labelEn: "Agricultural Inputs",
    color: "#9333ea",
    accent: "rgba(147,51,234,0.12)",
    // PDF: "সার, উন্নতমানের বীজ, সেচ ও কীটনাশক সুবিধা"
    descBn: "সরকার নির্ধারিত মূল্যে সার, উন্নতমানের বীজ, সেচ ও কীটনাশক সুবিধা নিশ্চিত করা হবে।",
    descEn: "Seeds, fertilizers (Urea, TSP, MOP, DAP), irrigation & pesticides at government-fixed prices.",
    details: ["ইউরিয়া, টিএসপি, এমওপি", "BADC বীজ", "কীটনাশক", "সেচ সুবিধা"],
  },
  {
    icon: "🚜",
    label: "কৃষি যন্ত্রপাতি ক্রয়ে ভর্তুকি",
    labelEn: "Farm Machinery Subsidy",
    color: "#ea580c",
    accent: "rgba(234,88,12,0.12)",
    // PDF: "রাইস ট্রান্সপ্লান্টার, ট্রাক্টর, পাওয়ার টিলার, কম্বাইন হার্ভেস্টর"
    descBn: "রাইস ট্রান্সপ্লান্টার, ট্রাক্টর, পাওয়ার টিলার, কম্বাইন হার্ভেস্টর ক্রয়ে ভর্তুকি পাওয়া যাবে।",
    descEn: "Subsidised mechanisation — rice transplanters, tractors, power tillers & combine harvesters.",
    details: ["রাইস ট্রান্সপ্লান্টার", "কম্বাইন হার্ভেস্টর", "পাওয়ার টিলার", "ট্রাক্টর"],
  },
  {
    icon: "🏪",
    label: "উৎপাদিত ফসলের ন্যায্যমূল্য",
    labelEn: "Fair Market Price",
    color: "#b45309",
    accent: "rgba(180,83,9,0.12)",
    // PDF: "সরকারিভাবে কৃষকের উৎপাদিত কৃষি পণ্য সরাসরি ক্রয়ের জন্য কৃষক কার্ড ব্যবহার"
    descBn: "সরকারিভাবে কৃষকের উৎপাদিত ফসল সরাসরি ক্রয় কার্যক্রমে কৃষক কার্ড ব্যবহার করা যাবে।",
    descEn: "Direct government procurement at fair prices — eliminates middlemen for paddy, wheat & other crops.",
    details: ["সরাসরি সরকারি ক্রয়", "ন্যায্যমূল্য নিশ্চিত", "শস্য সংরক্ষণ", "বাজার সংযোগ"],
  },
  {
    icon: "📱",
    label: "ডিজিটাল ব্যাংকিং সুবিধা",
    labelEn: "Digital Banking",
    color: "#0891b2",
    accent: "rgba(8,145,178,0.12)",
    // PDF: "মোবাইল ব্যাংকিং বা এটিএম এর মাধ্যমে লেনদেন, ব্যাংকিং, মোবাইল ব্যাংকিং ও নিরাপদ পেমেন্ট"
    descBn: "মোবাইল ব্যাংকিং বা এটিএমের মাধ্যমে লেনদেন করা যাবে। নিরাপদ পেমেন্ট ও আর্থিক সেবায় প্রবেশাধিকার নিশ্চিত।",
    descEn: "Mobile banking, ATM transactions, digital payments — full financial inclusion for rural farmers.",
    details: ["মোবাইল ব্যাংকিং", "ATM লেনদেন", "নিরাপদ পেমেন্ট", "ডিজিটাল ওয়ালেট"],
  },
  {
    icon: "🛡️",
    label: "কৃষি বীমা সুবিধা",
    labelEn: "Agricultural Insurance",
    color: "#dc2626",
    accent: "rgba(220,38,38,0.12)",
    // PDF: "বন্যা, খরা বা অন্যান্য প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্ত কৃষকরা দ্রুত সহায়তার আওতায় আসবেন"
    descBn: "বন্যা, খরা বা প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্ত কৃষকরা এই কার্ডের মাধ্যমে দ্রুত সহায়তা পাবেন।",
    descEn: "Crop, livestock & fish insurance — rapid relief for flood, drought and natural disaster losses.",
    details: ["শস্য বীমা", "পশু বীমা", "মৎস্য বীমা", "দুর্যোগ সহায়তা"],
  },
  {
    icon: "🏥",
    label: "স্বাস্থ্য সুরক্ষা",
    labelEn: "Health Protection",
    color: "#db2777",
    accent: "rgba(219,39,119,0.12)",
    // PDF: "কৃষক কার্ড ব্যবহার করার মাধ্যমে কৃষকদের স্বাস্থ্য বীমায় অন্তর্ভুক্তকরণ করা হবে"
    descBn: "কৃষক কার্ডের মাধ্যমে কৃষক ও তাদের পরিবারকে স্বাস্থ্য বীমায় অন্তর্ভুক্তকরণ করা হবে।",
    descEn: "Health insurance enrollment for farmer & family — covering medical costs & emergencies.",
    details: ["স্বাস্থ্য বীমা", "পরিবার কভারেজ", "হাসপাতাল সুবিধা", "ওষুধ ভর্তুকি"],
  },
  {
    icon: "🎓",
    label: "কৃষি প্রশিক্ষণ ও তথ্য সেবা",
    labelEn: "Training & Info Services",
    color: "#7c3aed",
    accent: "rgba(124,58,237,0.12)",
    // PDF: "আধুনিক কৃষি প্রযুক্তিসহ অন্যান্য বিষয়ে প্রশিক্ষণ এবং আবহাওয়ার তথ্য ও বাজার মূল্য সংক্রান্ত তথ্য"
    descBn: "আধুনিক কৃষি প্রযুক্তি, আবহাওয়ার তথ্য, বাজার মূল্য ও স্মার্ট অ্যাপের মাধ্যমে কৃষি বিষয়ক প্রশ্নের উত্তর পাওয়া যাবে।",
    descEn: "Modern agri-tech training, weather forecasts, market price alerts & smart app advisory.",
    details: ["আধুনিক কৃষি প্রযুক্তি", "আবহাওয়া তথ্য", "বাজার মূল্য আপডেট", "IPM প্রশিক্ষণ"],
  },
  {
    icon: "💾",
    label: "ডিজিটাল রেকর্ড সংরক্ষণ",
    labelEn: "Digital Record Keeping",
    color: "#0f766e",
    accent: "rgba(15,118,110,0.12)",
    // PDF: "কৃষকের প্রকৃত জমির পরিমাণ, উৎপাদন এবং আয়-ব্যয়ের ডিজিটাল তথ্য ভান্ডার"
    descBn: "কৃষকের জমির পরিমাণ, উৎপাদন এবং আয়-ব্যয়ের ডিজিটাল তথ্য ভান্ডার তৈরি হবে।",
    descEn: "Secure digital vault for land records, yield history, financial data & subsidy transaction logs.",
    details: ["জমির রেকর্ড", "উৎপাদন ইতিহাস", "আয়-ব্যয় বিবরণী", "লেনদেনের ইতিহাস"],
  },
  {
    icon: "📦",
    label: "শস্য সংরক্ষণ সুবিধা",
    labelEn: "Crop Storage Facility",
    color: "#92400e",
    accent: "rgba(146,64,14,0.12)",
    // From services diagram in PDF: "শস্য সংরক্ষণ সুবিধা"
    descBn: "উপজেলা ও জেলা পর্যায়ে গুদামে শস্য সংরক্ষণের সুবিধা কৃষক কার্ডের মাধ্যমে নিশ্চিত করা হবে।",
    descEn: "Access to government grain warehouses at upazila & district level to store crops and control market timing.",
    details: ["উপজেলা গুদাম", "জেলা সাইলো", "ন্যায্যমূল্যে সংরক্ষণ", "বাজার সময় নিয়ন্ত্রণ"],
  },
];

// ─── Blockchain ledger events ──────────────────────────────────────────────────
export const LEDGER_EVENTS = [
  { time: "09:42 AM", event: "Subsidy disbursed — Tk 3,200 (Urea fertilizer)", hash: "0x4a8fc3…c91d", type: "subsidy", status: "confirmed" },
  { time: "08:15 AM", event: "Soil moisture sensor data recorded", hash: "0x77bc1f…ef02", type: "iot", status: "confirmed" },
  { time: "Yesterday", event: "Seasonal crop loan application submitted", hash: "0x1fa332…8b44", type: "loan", status: "pending" },
  { time: "2 days ago", event: "Health insurance premium auto-paid", hash: "0x9c5e78…3d71", type: "insurance", status: "confirmed" },
  { time: "3 days ago", event: "Market price data sync — 6 commodities", hash: "0xab12cd…7f23", type: "market", status: "confirmed" },
  { time: "4 days ago", event: "Crop registration: Maize (Rabi 2025)", hash: "0xde45ef…1a89", type: "crop", status: "confirmed" },
];

// ─── Weather forecast (mock) ──────────────────────────────────────────────────
export const WEATHER = [
  { day: "Mon", rain: 12, temp: 28, humidity: 72 },
  { day: "Tue", rain: 5,  temp: 31, humidity: 65 },
  { day: "Wed", rain: 28, temp: 26, humidity: 84 },
  { day: "Thu", rain: 18, temp: 27, humidity: 79 },
  { day: "Fri", rain: 2,  temp: 33, humidity: 61 },
  { day: "Sat", rain: 45, temp: 24, humidity: 90 },
  { day: "Sun", rain: 8,  temp: 30, humidity: 70 },
];

// ─── AI advisor system prompt ─────────────────────────────────────────────────
export const AI_SYSTEM_PROMPT = `You are an expert AI agricultural advisor integrated into the Bangladesh Farmers Card (কৃষক কার্ড) system, developed by the Department of Agricultural Extension (DAE).

Your role is to help smallholder farmers across Bangladesh with:
- Crop disease identification and management
- Fertilizer and input recommendations (aligned with DAE guidelines)
- Integrated Pest Management (IPM) advice
- Weather-based planting and irrigation guidance  
- Government subsidy and loan schemes (কৃষক কার্ড benefits)
- Market timing and price outlook
- Post-harvest handling and storage

Context about the farmer you are assisting:
- Name: Md. Abul Rahman, Small Farmer, Munshiganj district, Dhaka division
- Land: 187 decimal (own + sharecrop)
- Current crops: Banana (Kharif-1), Potato (Rabi), Mango (Kharif-2), Maize (Rabi)
- Registered under Krishok Card scheme

Guidelines:
- Be concise and practical — farmers need actionable steps, not textbooks
- Respond in English but include Bengali crop/chemical names in parentheses where helpful
- Always recommend consulting the local Sub-Assistant Agriculture Officer (SAAO) for field verification
- Do not recommend banned pesticides or practices that violate Bangladesh DAE policy
- Keep responses under 200 words unless the question requires more detail`;

export const SUGGESTED_QUESTIONS = [
  "Best fertilizer dose for late boro rice?",
  "My banana leaves have yellow-brown spots",
  "When should I sell potatoes for best price?",
  "How do I apply for the Krishok Card crop loan?",
  "Signs of blast disease in maize?",
  "How to reduce irrigation cost during dry season?",
];
