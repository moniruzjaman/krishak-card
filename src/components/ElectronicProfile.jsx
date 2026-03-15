import { useState } from "react";
import { Inp, SecHead, TabBar } from "./ui";
import { DIVISIONS, FARMER_CATS, SEED_SRC, IRRIGATION, EMPTY } from "../constants";

export const ElectronicProfile = ({ profile, onChange, onSave, saved }) => {
  const [sec, setSec] = useState("personal");
  const f = k => profile[k]??"";
  const s = k => v => onChange({...profile,[k]:v});
  const filled = Object.values(profile).filter(v=>v&&v!=="না"&&v!=="").length;
  const pct = Math.round((filled/Object.keys(EMPTY).length)*100);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-emerald-800">প্রোফাইল সম্পূর্ণতা</span>
          <span className="text-sm font-black text-emerald-700">{pct}% ({filled}/{Object.keys(EMPTY).length})</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-emerald-200">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{width:`${pct}%`}} />
        </div>
        <div className="text-[10px] text-emerald-600 mt-1">BBS, DAE ও মাঠ পর্যায় থেকে সংগৃহীত ৩৩টি সুনির্দিষ্ট প্যারামিটার · সংযুক্তি-১</div>
      </div>

      <TabBar tabs={[{id:"personal",icon:"👤",label:"ব্যক্তিগত"},{id:"land",icon:"🗺️",label:"জমি"},{id:"agri",icon:"🌾",label:"কৃষি"},{id:"livestock",icon:"🐄",label:"পশু"}]} active={sec} onChange={setSec} />

      {sec==="personal" && (
        <div className="space-y-3">
          <SecHead title="ব্যক্তিগত তথ্য" subtitle="Fields 1–12 · DAE Electronic Profile" icon="👤" />
          <Inp label="কৃষক/কৃষানীর নাম" value={f("name")} onChange={s("name")} placeholder="সম্পূর্ণ নাম" required />
          <Inp label="পিতা/মাতা/স্বামী/স্ত্রীর নাম" value={f("fatherMotherSpouse")} onChange={s("fatherMotherSpouse")} placeholder="অভিভাবকের নাম" />
          <Inp label="লিঙ্গ" value={f("gender")} onChange={s("gender")} options={["পুরুষ","মহিলা","অন্যান্য"]} />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="বিভাগ" value={f("division")} onChange={s("division")} options={DIVISIONS} />
            <Inp label="জেলা" value={f("district")} onChange={s("district")} placeholder="জেলার নাম" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="উপজেলা" value={f("upazila")} onChange={s("upazila")} placeholder="উপজেলার নাম" />
            <Inp label="ইউনিয়ন/পৌরসভা" value={f("union")} onChange={s("union")} placeholder="ইউনিয়ন" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="ওয়ার্ড নং" value={f("ward")} onChange={s("ward")} placeholder="ওয়ার্ড" />
            <Inp label="গ্রাম/মহল্লা" value={f("village")} onChange={s("village")} placeholder="গ্রামের নাম" />
          </div>
          <Inp label="জাতীয় পরিচয়পত্র নম্বর" value={f("nid")} onChange={s("nid")} placeholder="১৭ সংখ্যার NID" required />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="জন্ম তারিখ" value={f("dob")} onChange={s("dob")} type="date" />
            <Inp label="শিক্ষাগত যোগ্যতা" value={f("education")} onChange={s("education")} options={["নিরক্ষর","প্রাথমিক","মাধ্যমিক","উচ্চমাধ্যমিক","স্নাতক","স্নাতকোত্তর"]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="মোবাইল নম্বর" value={f("mobile")} onChange={s("mobile")} placeholder="০১XXXXXXXXX" required />
            <Inp label="পরিবারের সদস্য সংখ্যা" value={f("familyMembers")} onChange={s("familyMembers")} type="number" placeholder="সংখ্যা" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="GPS অক্ষাংশ" value={f("gpsLat")} onChange={s("gpsLat")} placeholder="23.8103" />
            <Inp label="GPS দ্রাঘিমাংশ" value={f("gpsLng")} onChange={s("gpsLng")} placeholder="90.4125" />
          </div>
        </div>
      )}

      {sec==="land" && (
        <div className="space-y-3">
          <SecHead title="জমির তথ্য" subtitle="Fields 13–18 · GPS Location & Ownership" icon="🗺️" />
          <Inp label="কৃষকের শ্রেণী" value={f("farmerCategory")} onChange={s("farmerCategory")} options={FARMER_CATS} />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="মোট জমি (শতাংশ)" value={f("totalLand")} onChange={s("totalLand")} type="number" placeholder="যেমন: ১৫০" />
            <Inp label="মোট আবাদী জমি (শতাংশ)" value={f("cultivatedLand")} onChange={s("cultivatedLand")} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="বর্গাচাষী জমি (শতাংশ)" value={f("sharecropLand")} onChange={s("sharecropLand")} type="number" />
            <Inp label="বর্গাদেওয়া জমি (শতাংশ)" value={f("leasedOutLand")} onChange={s("leasedOutLand")} type="number" />
          </div>
          <Inp label="ফলবাগান/নার্সারি (শতাংশ)" value={f("orchardNursery")} onChange={s("orchardNursery")} type="number" />
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 space-y-3">
            <div className="text-xs font-bold text-blue-700">📍 জমির মৌজা ও দাগ তথ্য (জমির মালিকানা)</div>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="মৌজার নাম" value={f("mouza")} onChange={s("mouza")} placeholder="মৌজার নাম" />
              <Inp label="দাগ নম্বর" value={f("dagNo")} onChange={s("dagNo")} placeholder="দাগ নম্বর" />
              <Inp label="খতিয়ান নম্বর" value={f("khatian")} onChange={s("khatian")} placeholder="RS/BS খতিয়ান" />
              <Inp label="জলাশয় সংখ্যা" value={f("pondCount")} onChange={s("pondCount")} type="number" />
            </div>
            <Inp label="জলাশয়ের মোট আয়তন (শতাংশ)" value={f("pondArea")} onChange={s("pondArea")} type="number" />
          </div>
        </div>
      )}

      {sec==="agri" && (
        <div className="space-y-3">
          <SecHead title="কৃষি উৎপাদন তথ্য" subtitle="Fields 19–28 · Seasonal Crops & Inputs" icon="🌾" />
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
            <div className="text-xs font-bold text-emerald-700">🗓️ মৌসুমভিত্তিক আবাদকৃত ফসল</div>
            {[["robiCrops","রবি (অক্টোবর–মার্চ)"],["kharif1Crops","খরিপ-১ (মার্চ–জুলাই)"],["kharif2Crops","খরিপ-২ (জুলাই–অক্টোবর)"]].map(([k,l])=>(
              <Inp key={k} label={l} value={f(k)} onChange={s(k)} placeholder="যেমন: ধান, গম, সরিষা" />
            ))}
          </div>
          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 space-y-3">
            <div className="text-xs font-bold text-teal-700">🧪 সার ব্যবহার (কেজি/বিঘা)</div>
            <div className="grid grid-cols-2 gap-3">
              {[["urea","ইউরিয়া"],["tsp","টিএসপি"],["mop","এমওপি"],["dap","ডিএপি সার"],["organicFertilizer","জৈব সার"]].map(([k,l])=>(
                <Inp key={k} label={l} value={f(k)} onChange={s(k)} type="number" placeholder="কেজি/বিঘা" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="বীজের উৎস" value={f("seedSource")} onChange={s("seedSource")} options={SEED_SRC} />
            <Inp label="সেচ ব্যবস্থার ধরন" value={f("irrigationType")} onChange={s("irrigationType")} options={IRRIGATION} />
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-3">
            <div className="text-xs font-bold text-amber-700">💰 প্রণোদনা ও ঋণ তথ্য (Fields 24–25)</div>
            {[["subsidyRobi","রবি প্রণোদনা (টাকা)"],["subsidyKharif1","খরিপ-১ প্রণোদনা"],["subsidyKharif2","খরিপ-২ প্রণোদনা"],["loanAmount","কৃষি ঋণ (মৌসুমী, টাকা)"]].map(([k,l])=>(
              <Inp key={k} label={l} value={f(k)} onChange={s(k)} type="number" placeholder="পরিমাণ" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["cropInsurance","শস্য বীমা (২৬)"],["livestockInsurance","পশু বীমা (২৬)"],["fishInsurance","মৎস্য বীমা (২৬)"],["warehouseAccess","শস্য গুদাম (২৭)"]].map(([k,l])=>(
              <Inp key={k} label={l} value={f(k)} onChange={s(k)} options={["না","হ্যাঁ"]} />
            ))}
          </div>
        </div>
      )}

      {sec==="livestock" && (
        <div className="space-y-3">
          <SecHead title="পশুসম্পদ ও মৎস্য" subtitle="Fields 28–33 · Livestock, Fisheries & Biometric" icon="🐄" />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="মৎস্য চাষকৃত জলাশয় (শতাংশ)" value={f("fishCultivatedArea")} onChange={s("fishCultivatedArea")} type="number" />
            <Inp label="গবাদিপশুর সংখ্যা" value={f("livestockCount")} onChange={s("livestockCount")} type="number" />
            <Inp label="পশু/হাঁস-মুরগির ধরন" value={f("livestockType")} onChange={s("livestockType")} placeholder="গরু, ছাগল, মুরগি" />
            <Inp label="খামার সংখ্যা" value={f("farmCount")} onChange={s("farmCount")} type="number" />
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <div className="text-xs font-bold text-emerald-700 mb-3">🔐 বায়োমেট্রিক তথ্য (Fields 32–33)</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                <div className="text-2xl mb-1">🫆</div>
                <div className="text-xs font-bold text-emerald-700">ফিঙ্গারপ্রিন্ট</div>
                <span className="text-[10px] text-emerald-600 font-bold">{f("fingerprint")||"নিবন্ধন প্রয়োজন"}</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                <div className="text-2xl mb-1">📸</div>
                <div className="text-xs font-bold text-emerald-700">ছবি (Field 33)</div>
                <span className="text-[10px] text-slate-500">{f("photo")?"আপলোড করা হয়েছে":"আপলোড প্রয়োজন"}</span>
              </div>
            </div>
            <div className="mt-3">
              <Inp label="কৃষকের স্বাক্ষর তারিখ (Field 32)" value={f("signatureDate")} onChange={s("signatureDate")} type="date" />
            </div>
          </div>
        </div>
      )}

      <button onClick={onSave}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm shadow-lg active:scale-95 transition-all">
        {saved?"✅ প্রোফাইল সংরক্ষিত হয়েছে":"💾 প্রোফাইল সংরক্ষণ করুন"}
      </button>
    </div>
  );
};
