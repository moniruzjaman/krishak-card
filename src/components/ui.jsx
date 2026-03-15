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

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div 
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", 
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 300, backdropFilter: "blur(4px)", padding: "20px"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#1e293b", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#6ee7b7", margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer", padding: "0", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.6 }}>
          {children}
        </div>
        <button 
          onClick={onClose}
          style={{
            marginTop: "20px", width: "100%", padding: "12px",
            background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: "8px", color: "#6ee7b7", fontSize: "14px", fontWeight: "600", cursor: "pointer"
          }}
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};
