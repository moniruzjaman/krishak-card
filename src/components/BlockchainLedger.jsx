import { useState } from "react";
import { SecHead } from "./ui";
import { BLOCKCHAIN_TXN } from "../constants";

export const BlockchainLedger = () => {
  const [sel, setSel] = useState(null);
  return (
    <div className="space-y-4">
      <SecHead title="ব্লকচেইন লেজার" subtitle="Hyperledger Fabric · PBFT · ~600 TPS · SSI · XACML" icon="⛓️" />
      <div className="grid grid-cols-3 gap-2">
        {[{l:"মোট লেনদেন",v:"47",i:"📊"},{l:"যাচাইকৃত",v:"45",i:"✅"},{l:"মুলতুবি",v:"2",i:"⏳"}].map(({l,v,i})=>(
          <div key={l} className="bg-slate-800 rounded-2xl p-3 text-center">
            <div className="text-xl">{i}</div>
            <div className="text-white font-black text-lg">{v}</div>
            <div className="text-slate-400 text-[10px]">{l}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {BLOCKCHAIN_TXN.map(txn=>(
          <div key={txn.id} onClick={()=>setSel(sel?.id===txn.id?null:txn)}
            className="bg-slate-800 rounded-2xl p-4 border border-slate-700 cursor-pointer hover:border-emerald-600 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${txn.status==="confirmed"?"bg-emerald-400":"bg-amber-400 animate-pulse"}`} />
                <div>
                  <div className="text-white text-sm font-bold">{txn.type}</div>
                  <div className="text-slate-400 text-[10px] font-mono">{txn.hash}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-black text-sm">{txn.amount}</div>
                <div className="text-slate-500 text-[10px]">{txn.date}</div>
              </div>
            </div>
            {sel?.id===txn.id && (
              <div className="mt-3 pt-3 border-t border-slate-700 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Transaction ID:</span><span className="font-mono text-emerald-400">{txn.id}</span></div>
                <div className="flex justify-between"><span>Consensus Protocol:</span><span className="text-white">PBFT · ~500ms latency</span></div>
                <div className="flex justify-between"><span>Storage:</span><span className="text-white">On-chain + IPFS/Hadoop</span></div>
                <div className="flex justify-between"><span>Identity:</span><span className="text-white">SSI · DID + Verifiable Credentials</span></div>
                <div className="flex justify-between"><span>Access Control:</span><span className="text-white">XACML · ABAC Policy</span></div>
                <div className="flex justify-between"><span>Status:</span><span className={txn.status==="confirmed"?"text-emerald-400":"text-amber-400"}>{txn.status==="confirmed"?"✅ Confirmed":"⏳ Pending"}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="text-xs font-bold text-emerald-400 mb-3">🏗️ Hybrid Data Architecture</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-900 rounded-xl p-3">
            <div className="text-emerald-400 text-xs font-bold mb-1">On-Chain Storage</div>
            <div className="text-slate-400 text-[10px] space-y-0.5"><div>• Access Control</div><div>• Smart Contracts</div><div>• Provenance Records</div></div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3">
            <div className="text-amber-400 text-xs font-bold mb-1">Off-Chain (IPFS+Hadoop)</div>
            <div className="text-slate-400 text-[10px] space-y-0.5"><div>• Sensor/IoT Data</div><div>• Images/Documents</div><div>• Scalability Layer</div></div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 text-center">
          <div className="text-slate-300 text-xs font-bold mb-1">Interoperability: Cross-chain Bridges · POLARIS Architecture</div>
          <div className="text-slate-500 text-[10px]">Data Ecosystem: সরকার ↔ কৃষক ↔ গবেষক ↔ বাণিজ্যিক প্রতিষ্ঠান</div>
        </div>
      </div>
    </div>
  );
};
