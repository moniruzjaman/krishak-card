import { SERVICES } from "../constants";

export const PhysicalCard = ({ p, flipped, onFlip }) => {
  const cardId = `KC-${new Date().getFullYear()}-${(p.division||"XX").substring(0,2)}-${(p.nid||"000000").slice(-6)}`;
  return (
    <div style={{perspective:"1200px"}}>
      <div className="relative transition-all duration-700 cursor-pointer" onClick={onFlip}
        style={{transformStyle:"preserve-3d",transform:flipped?"rotateY(180deg)":"rotateY(0deg)",minHeight:220}}>

        {/* FRONT */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl" style={{backfaceVisibility:"hidden"}}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700" />
          <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"16px 16px"}} />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
          <div className="relative z-10 p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">🌾</div>
                <div>
                  <div className="text-amber-300 font-black text-sm">কৃষক কার্ড</div>
                  <div className="text-emerald-200 text-[9px] tracking-widest uppercase">DAE · Bangladesh</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/40 text-[8px] uppercase tracking-widest">Card ID</div>
                <div className="text-amber-300 font-mono text-[10px] font-bold">{cardId}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-2xl border-2 border-white/20 flex-shrink-0">
                {p.gender==="মহিলা"?"👩🌾":"👨🌾"}
              </div>
              <div className="min-w-0">
                <div className="text-white font-black text-lg leading-tight truncate">{p.name||"কৃষকের নাম"}</div>
                <div className="text-emerald-200 text-xs">{p.division||"বিভাগ"} · {p.upazila||p.district||"উপজেলা"}</div>
                <div className="mt-0.5 inline-flex items-center px-2 py-0.5 bg-amber-400/20 rounded-full border border-amber-400/30">
                  <span className="text-amber-300 text-[9px] font-bold">{p.farmerCategory||"ক্ষুদ্র কৃষক"}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{l:"NID",v:p.nid?p.nid.slice(0,8)+"***":"—"},{l:"জমি",v:p.totalLand?p.totalLand+" শ.":"—"},{l:"মোবাইল",v:p.mobile?p.mobile.slice(0,7)+"***":"—"}].map(({l,v})=>(
                <div key={l} className="bg-white/10 rounded-xl p-2 border border-white/10">
                  <div className="text-emerald-300 text-[8px] uppercase">{l}</div>
                  <div className="text-white text-[11px] font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-white/25 text-[9px] tracking-widest uppercase">↕ ট্যাপ করুন পেছনের দিক দেখতে</div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl" style={{backfaceVisibility:"hidden",transform:"rotateY(180deg)"}}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
          <div className="relative z-10 p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-amber-300 font-black text-sm">সেবাসমূহ</div>
                <div className="text-slate-400 text-[9px]">10 Active Services</div>
              </div>
              <div className="text-emerald-400 text-xs font-bold border border-emerald-700 px-2 py-1 rounded-lg">✓ Blockchain Verified</div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {SERVICES.map(s=>(
                <div key={s.id} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-1.5 border border-white/10">
                  <span className="text-sm">{s.icon}</span>
                  <div className="text-[7px] text-slate-300 text-center leading-tight">{s.title.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div>
                <div className="text-slate-500 text-[8px]">Hyperledger Fabric · PBFT · SSI</div>
                <div className="text-slate-400 font-mono text-[9px]">{cardId}</div>
              </div>
              <div className="text-right">
                <div className="text-amber-400 text-[9px] font-bold">স্বপ্ন নয় বাস্তবতা এক সাথে</div>
                <div className="text-slate-500 text-[8px]">DAE · বাংলাদেশ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
