// ─── Farmer profile (demo) ───────────────────────────────────────────────────
export const FARMER = {
  name: "Md. Abul Rahman",
  nameBn: "মোঃ আবুল রহমান",
  district: "Munshiganj",
  division: "Dhaka",
  upazila: "Sirajdikhan",
  nid: "19**-****-3241",
  cardNo: "8801 4523 9017",
  land: "187 dec",
  category: "Small Farmer",
  categoryBn: "ক্ষুদ্র কৃষক",
  balance: "৳ 12,450",
  loanDue: "৳ 8,200",
  subsidyBalance: "৳ 4,800",
  phone: "01712-XXXXXX",
  gps: "23.5204° N, 90.4272° E",
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

// ─── Services ─────────────────────────────────────────────────────────────────
export const SERVICES = [
  { icon: "💳", label: "Subsidies", bn: "ভর্তুকি", color: "#16a34a", desc: "Fertilizer, seed & irrigation subsidies" },
  { icon: "🏦", label: "Agri Loan", bn: "কৃষি ঋণ", color: "#0284c7", desc: "Low-interest seasonal & term loans" },
  { icon: "🌱", label: "Seeds & Inputs", bn: "বীজ/উপকরণ", color: "#9333ea", desc: "Gov't-rate seeds, fertilizer, pesticides" },
  { icon: "🚜", label: "Machinery", bn: "যন্ত্রপাতি", color: "#ea580c", desc: "Subsidy on tractors, harvesters & tillers" },
  { icon: "🛡️", label: "Crop Insurance", bn: "শস্য বীমা", color: "#dc2626", desc: "Flood, drought & natural disaster cover" },
  { icon: "📊", label: "Market Info", bn: "বাজার তথ্য", color: "#0891b2", desc: "Live commodity prices & demand data" },
  { icon: "🎓", label: "Training", bn: "প্রশিক্ষণ", color: "#7c3aed", desc: "Modern agri-tech & IPM training" },
  { icon: "🏥", label: "Health Cover", bn: "স্বাস্থ্য সুরক্ষা", color: "#db2777", desc: "Health insurance for farmer families" },
  { icon: "🏪", label: "Govt Purchase", bn: "সরকারী ক্রয়", color: "#b45309", desc: "Direct govt procurement at fair price" },
  { icon: "💾", label: "Digital Record", bn: "ডিজিটাল রেকর্ড", color: "#0f766e", desc: "Land, yield & income data vault" },
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
