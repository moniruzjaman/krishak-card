export const DIVISIONS = ["ঢাকা","রাজশাহী","রংপুর","ময়মনসিংহ","খুলনা","বরিশাল","সিলেট","চট্টগ্রাম"];
export const PILOT_UPAZILAS = {
  "ঢাকা": { upazila: "সিরাজদিখান", district: "মুন্সীগঞ্জ", crop: "কলা 🍌" },
  "রাজশাহী": { upazila: "শিবগঞ্জ", district: "বগুড়া", crop: "আলু ও কলা 🥔" },
  "রংপুর": { upazila: "মিঠাপুকুর", district: "রংপুর", crop: "আম ও সবজি 🥭" },
  "ময়মনসিংহ": { upazila: "ইসলামপুর", district: "জামালপুর", crop: "ভুট্টা ও মরিচ 🌽" },
  "খুলনা": { upazila: "ঝিকরগাছা", district: "যশোর", crop: "ফুল/নার্সারি 🌸" },
  "বরিশাল": { upazila: "নেছারাবাদ", district: "পিরোজপুর", crop: "পেয়ারা 🍐" },
  "সিলেট": { upazila: "জুড়ী", district: "মৌলভীবাজার", crop: "কমলা 🍊" },
  "চট্টগ্রাম": { upazila: "টেকনাফ", district: "কক্সবাজার", crop: "শুটকী মাছ 🐟" },
};
export const FARMER_CATS = ["ভূমিহীন কৃষক","প্রান্তিক কৃষক","ক্ষুদ্র কৃষক","মাঝারি কৃষক","বড় কৃষক"];
export const IRRIGATION = ["বৃষ্টিনির্ভর","গভীর নলকূপ","অগভীর নলকূপ","সেচ খাল","ড্রিপ ইরিগেশন"];
export const SEED_SRC = ["DAE প্রত্যয়িত","BRRI/BARI অনুমোদিত","স্থানীয় বাজার","নিজস্ব সংরক্ষণ","হাইব্রিড কোম্পানি"];

export const SERVICES = [
  { id:"subsidy",icon:"💰",title:"ভর্তুকি ও প্রণোদনা",color:"emerald",desc:"সার, বীজ, সেচ উপকরণে সরাসরি সুবিধা",steps:["কার্ড স্ক্যান করুন","ফসল নির্বাচন করুন","পরিমাণ নিশ্চিত করুন","ডিজিটাল অনুমোদন পান"] },
  { id:"loan",icon:"🏦",title:"কৃষি ঋণ",color:"blue",desc:"সহজ ও স্বল্পসুদে প্রাতিষ্ঠানিক ঋণ",steps:["ঋণের পরিমাণ নির্ধারণ","জামানতমুক্ত আবেদন","ব্যাংক অনুমোদন","একাউন্টে জমা"] },
  { id:"inputs",icon:"🌱",title:"কৃষি উপকরণ",color:"teal",desc:"সার, বীজ, কীটনাশক সরকারি মূল্যে",steps:["ডিলারে কার্ড দেখান","উপকরণ স্ক্যান করুন","মূল্য যাচাই করুন","ডিজিটাল রশিদ নিন"] },
  { id:"machinery",icon:"🚜",title:"যন্ত্রপাতি ভর্তুকি",color:"amber",desc:"ট্র্যাক্টর, হার্ভেস্টার ভর্তুকি",steps:["যন্ত্র নির্বাচন","ভর্তুকির হার দেখুন","আবেদন জমা দিন","উপজেলা অনুমোদন"] },
  { id:"market",icon:"📊",title:"সরাসরি বাজার",color:"purple",desc:"মধ্যস্বত্বভোগী ছাড়া ন্যায্যমূল্য",steps:["ফসল নিবন্ধন","ক্রেতা খুঁজুন","মূল্য চুক্তি","পেমেন্ট পান"] },
  { id:"banking",icon:"📱",title:"ই-ব্যাংকিং",color:"indigo",desc:"মোবাইল ব্যাংকিং ও এটিএম সুবিধা",steps:["অ্যাকাউন্ট লিঙ্ক","পিন সেট করুন","লেনদেন করুন","SMS নিশ্চিতকরণ"] },
  { id:"insurance",icon:"🛡️",title:"কৃষি ও স্বাস্থ্য বীমা",color:"rose",desc:"প্রাকৃতিক দুর্যোগে দ্রুত ক্ষতিপূরণ",steps:["বীমা স্কিম নির্বাচন","প্রিমিয়াম পেমেন্ট","ক্ষতি রিপোর্ট","ক্ষতিপূরণ দাবি"] },
  { id:"storage",icon:"🏪",title:"শস্য সংরক্ষণ",color:"orange",desc:"গুদাম সুবিধা ও কোল্ড স্টোরেজ",steps:["গুদাম বুক করুন","ফসল জমা দিন","ডিজিটাল রশিদ","পরিবহন ট্র্যাক"] },
  { id:"training",icon:"📚",title:"প্রশিক্ষণ ও তথ্য",color:"cyan",desc:"আধুনিক কৃষি প্রযুক্তি ও আবহাওয়া তথ্য",steps:["কোর্স নির্বাচন","অনলাইন অংশগ্রহণ","সনদ অর্জন","XP পয়েন্ট পান"] },
  { id:"records",icon:"🗂️",title:"ডিজিটাল রেকর্ড",color:"slate",desc:"জমি, উৎপাদন ও আয়-ব্যয়ের তথ্যভাণ্ডার",steps:["তথ্য আপলোড","Blockchain সংরক্ষণ","ইতিহাস দেখুন","রিপোর্ট ডাউনলোড"] },
];

export const BLOCKCHAIN_TXN = [
  { id:"BC-2025-001",type:"ভর্তুকি",amount:"৳ ৩,৫০০",date:"০১ জানু ২০২৫",status:"confirmed",hash:"0x4f7a2b9c..." },
  { id:"BC-2025-002",type:"বীমা প্রিমিয়াম",amount:"৳ ১,২০০",date:"১৫ জানু ২০২৫",status:"confirmed",hash:"0x9c3e1d5a..." },
  { id:"BC-2025-003",type:"ঋণ পরিশোধ",amount:"৳ ৫,০০০",date:"০১ ফেব্রু ২০২৫",status:"confirmed",hash:"0x2a8f5c3b..." },
  { id:"BC-2025-004",type:"ফসল বিক্রয়",amount:"৳ ১৮,০০০",date:"২০ ফেব্রু ২০২৫",status:"pending",hash:"0x7d4b9e1f..." },
  { id:"BC-2025-005",type:"উপকরণ ক্রয়",amount:"৳ ২,৩০০",date:"০৫ মার্চ ২০২৫",status:"confirmed",hash:"0x1e6a3f8d..." },
];

export const EMPTY = {
  name:"",fatherMotherSpouse:"",gender:"পুরুষ",division:"ঢাকা",district:"",
  upazila:"",union:"",ward:"",village:"",nid:"",dob:"",education:"প্রাথমিক",
  otherOccupation:"না",mobile:"",familyMembers:"",gpsLat:"",gpsLng:"",
  totalLand:"",cultivatedLand:"",farmerCategory:"ক্ষুদ্র কৃষক",sharecropLand:"",
  leasedOutLand:"",orchardNursery:"",mouza:"",dagNo:"",khatian:"",
  robiCrops:"",kharif1Crops:"",kharif2Crops:"",
  urea:"",tsp:"",mop:"",dap:"",organicFertilizer:"",
  seedSource:"DAE প্রত্যয়িত",irrigationType:"অগভীর নলকূপ",
  subsidyRobi:"",subsidyKharif1:"",subsidyKharif2:"",loanAmount:"",
  cropInsurance:"না",livestockInsurance:"না",fishInsurance:"না",warehouseAccess:"না",
  pondCount:"",pondArea:"",fishCultivatedArea:"",
  livestockCount:"",livestockType:"",farmCount:"",
  signatureDate:"",fingerprint:"নিবন্ধিত",photo:""
};
