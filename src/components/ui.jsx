export const Inp = ({ label, value, onChange, type="text", placeholder, options, required }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {options ? (
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50">
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    ):(
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50" />
    )}
  </div>
);

export const SecHead = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-black text-slate-800 text-base">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex overflow-x-auto scrollbar-hide gap-1 bg-slate-100 p-1 rounded-2xl">
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>onChange(t.id)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${active===t.id?"bg-white text-emerald-700 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
        <span>{t.icon}</span><span>{t.label}</span>
      </button>
    ))}
  </div>
);
