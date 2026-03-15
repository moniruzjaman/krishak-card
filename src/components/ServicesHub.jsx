import { useState } from "react";
import { SecHead } from "./ui";
import { SERVICES } from "../constants";

export const ServicesHub = ({ profile }) => {
  const [active, setActive] = useState(null);
  const [step, setStep] = useState(0);
  const bgMap = { emerald:"border-emerald-200 bg-emerald-50 text-emerald-800", blue:"border-blue-200 bg-blue-50 text-blue-800", teal:"border-teal-200 bg-teal-50 text-teal-800", amber:"border-amber-200 bg-amber-50 text-amber-800", purple:"border-purple-200 bg-purple-50 text-purple-800", indigo:"border-indigo-200 bg-indigo-50 text-indigo-800", rose:"border-rose-200 bg-rose-50 text-rose-800", orange:"border-orange-200 bg-orange-50 text-orange-800", cyan:"border-cyan-200 bg-cyan-50 text-cyan-800", slate:"border-slate-200 bg-slate-50 text-slate-800" };

  if (active) {
    const svc = SERVICES.find(s=>s.id===active);
    return (
      <div className="space-y-4">
        <button onClick={()=>{setActive(null);setStep(0);}} className="flex items-center gap-2 text-sm text-slate-600 font-bold hover:text-emerald-700">← সেবার তালিকায় ফিরুন</button>
        <div className={`rounded-3xl p-5 border-2 ${bgMap[svc.color]}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{svc.icon}</span>
            <div><h3 className="font-black text-lg">{svc.title}</h3><p className="text-xs opacity-70">{svc.desc}</p></div>
          </div>
          <div className="space-y-2 mb-4">
            {svc.steps.map((st,i)=>(
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i<=step?"bg-white/70 shadow-sm":"opacity-40"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i<step?"bg-emerald-500 text-white":i===step?"bg-amber-400 text-white":"bg-white/50"}`}>
                  {i<step?"✓":i+1}
                </div>
                <span className="text-sm font-medium">{st}</span>
              </div>
            ))}
          </div>
          {step<svc.steps.length-1?(
            <button onClick={()=>setStep(p=>p+1)} className="w-full py-3 rounded-2xl bg-white/80 font-black text-sm border-2 border-current hover:bg-white">পরবর্তী ধাপ →</button>
          ):(
            <div className="text-center p-4 bg-white/80 rounded-2xl border-2 border-emerald-400">
              <div className="text-2xl mb-1">✅</div>
              <div className="font-black text-emerald-700">আবেদন সম্পন্ন হয়েছে!</div>
              <div className="text-xs text-slate-500 mt-1">SMS নিশ্চিতকরণ পাঠানো হবে: {profile.mobile||"আপনার মোবাইলে"}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SecHead title="কৃষক কার্ডের সেবাসমূহ" subtitle="১০টি সরকারি ও আর্থিক সেবা একক অ্যাক্সেস পয়েন্ট" icon="⚡" />
      <div className="grid grid-cols-2 gap-3">
        {SERVICES.map(svc=>(
          <button key={svc.id} onClick={()=>{setActive(svc.id);setStep(0);}}
            className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left hover:shadow-md active:scale-95 transition-all ${bgMap[svc.color]}`}>
            <span className="text-2xl">{svc.icon}</span>
            <div><div className="font-black text-sm leading-tight">{svc.title}</div><div className="text-[10px] opacity-60 mt-0.5">{svc.desc.slice(0,28)}…</div></div>
          </button>
        ))}
      </div>
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
        <div className="text-xs font-bold text-emerald-800 mb-1">📞 কল সেন্টার — বিনামূল্যে সহায়তা</div>
        <div className="text-2xl font-black text-emerald-700">১৬১২৩</div>
        <div className="text-xs text-slate-500">সার্বক্ষণিক সেবা · কৃষি বিষয়ক যেকোনো সমস্যায়</div>
      </div>
    </div>
  );
};
