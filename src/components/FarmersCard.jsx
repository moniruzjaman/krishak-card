import { FARMER } from "../data";

/**
 * Professional Krishok Card — faithful to DAE concept paper
 *
 * DESIGN SPEC from PDF card image:
 *   - Deep green card body (linear gradient)
 *   - "কৃষক কার্ড" in Noto Serif Bengali, large, top-left (white)
 *   - Gold EMV chip, top-right
 *   - Agricultural landscape strip (tractor + field + sky)
 *   - Tagline: "স্বপ্ন নয় বাস্তবতা এক সঙ্গে" in italic Bengali
 *   - Card number: 1234  5678  9012  format
 *   - VALID THRU  01/80
 *   - "Farmers Card" text bottom-right
 *   - Bangladesh Govt emblem / DAE branding
 */

const BN = { fontFamily: "'Noto Serif Bengali', serif" };
const UI = { fontFamily: "'Hind Siliguri', sans-serif" };
const MONO = { fontFamily: "'Courier New', Courier, monospace" };

/* ─── Bangladesh national emblem (inline SVG, simplified) ─── */
function BDEmblem({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flexShrink: 0 }}>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3.5"/>
      {/* Inner decorative ring */}
      <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      {/* Center — Shapla (water lily) */}
      <circle cx="50" cy="42" r="15" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      {/* Red sun disc */}
      <circle cx="50" cy="42" r="9" fill="rgba(220,38,38,0.8)"/>
      {/* Paddy sheaves (bottom) */}
      {[-22, -11, 0, 11, 22].map((x, i) => (
        <g key={i} transform={`translate(${50 + x}, 82)`}>
          <line x1="0" y1="0" x2="0" y2="-12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/>
          <ellipse cx="0" cy="-13" rx="2.5" ry="4" fill="rgba(255,255,255,0.55)" transform={`rotate(${(i - 2) * 10})`}/>
        </g>
      ))}
      {/* Water lilies (shapla) left & right */}
      {[-20, 20].map((x, i) => (
        <g key={i} transform={`translate(${50 + x}, 58)`}>
          <ellipse rx="7" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(15)"/>
          <ellipse rx="7" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(-15)"/>
          <circle r="3" fill="rgba(255,255,255,0.6)"/>
        </g>
      ))}
      {/* Stars at top */}
      {[-20, 0, 20].map((x, i) => (
        <circle key={i} cx={50 + x} cy={18} r={2.5} fill="rgba(255,255,255,0.6)"/>
      ))}
    </svg>
  );
}

/* ─── Gold EMV chip ─── */
function EMVChip() {
  return (
    <div style={{
      width: 48, height: 38, borderRadius: 7, flexShrink: 0,
      background: "linear-gradient(145deg, #fef9c3 0%, #fde68a 20%, #fbbf24 50%, #d97706 75%, #f59e0b 100%)",
      boxShadow: "0 3px 10px rgba(217,119,6,0.6), inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.2)",
      position: "relative", overflow: "hidden",
    }}>
      {/* 3×3 contact grid */}
      <div style={{
        position: "absolute", inset: 5,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr", gap: 2.5,
      }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{
            background: i === 4 ? "rgba(161,69,0,0.35)" : "rgba(0,0,0,0.13)",
            borderRadius: 1.5,
            border: i === 4 ? "none" : "0.5px solid rgba(150,90,0,0.22)",
          }}/>
        ))}
      </div>
      {/* Horizontal contact stripe */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%", height: 1.5,
        background: "rgba(161,69,0,0.28)", transform: "translateY(-50%)",
      }}/>
    </div>
  );
}

/* ─── Agricultural field landscape strip ─── */
function FieldScene() {
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: "40%", bottom: 0,
      overflow: "hidden", zIndex: 0, borderRadius: "0 0 20px 20px",
    }}>
      {/* Sky */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #1e3a8a 0%, #2563eb 40%, #60a5fa 100%)",
        opacity: 0.28,
      }}/>
      {/* Paddy field rows — forced perspective */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{
          position: "absolute",
          top: `${12 + i * 13}%`,
          left: `-${i * 3}%`, right: `-${i * 3}%`,
          height: `${9 + i * 1.2}%`,
          background: i % 2 === 0
            ? `rgba(21,128,61,${0.13 + i * 0.035})`
            : `rgba(22,163,74,${0.09 + i * 0.025})`,
          transform: `skewY(${-0.8 + i * 0.35}deg)`,
          borderTop: i % 2 === 0 ? "1px solid rgba(74,222,128,0.09)" : "none",
        }}/>
      ))}
      {/* Tractor silhouette */}
      <div style={{
        position: "absolute", bottom: "22%", left: "28%",
        fontSize: 22, opacity: 0.38, transform: "scaleX(-1)",
        filter: "brightness(0.35) saturate(0)",
      }}>🚜</div>
      {/* Tree silhouettes */}
      <div style={{ position: "absolute", bottom: "28%", right: "22%", fontSize: 18, opacity: 0.3, filter: "brightness(0.3) saturate(0)" }}>🌴</div>
      <div style={{ position: "absolute", bottom: "30%", right: "35%", fontSize: 14, opacity: 0.25, filter: "brightness(0.3) saturate(0)" }}>🌿</div>
      {/* Sun */}
      <div style={{
        position: "absolute", top: "8%", right: "16%",
        width: 14, height: 14, borderRadius: "50%",
        background: "rgba(253,224,71,0.65)",
        boxShadow: "0 0 14px 5px rgba(253,224,71,0.28)",
      }}/>
      {/* Gradient overlay — fades to card body colour */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(6,78,59,0.95) 0%, rgba(6,78,59,0.2) 35%, rgba(4,120,87,0.05) 100%)",
      }}/>
    </div>
  );
}

/* ─── Magnetic stripe (back card detail) ─── */
function MagStripe() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 26, height: i === 1 ? 3 : 2, borderRadius: 2,
          background: i === 1 ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.3)",
        }}/>
      ))}
    </div>
  );
}

/* ─── Profile section on back ─── */
function ProfileSection({ title, icon, fields }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, marginBottom: 5,
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ ...BN, fontSize: 11.5, fontWeight: 700, color: "#94a3b8" }}>{title}</span>
      </div>
      <div style={{
        background: "rgba(255,255,255,0.022)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 9, overflow: "hidden",
      }}>
        {fields.map(([no, label, value], ri) => (
          <div key={ri} style={{
            display: "flex",
            borderBottom: ri < fields.length - 1 ? "1px solid rgba(255,255,255,0.038)" : "none",
            background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
          }}>
            <div style={{
              width: 30, flexShrink: 0, padding: "5px 6px",
              color: "#475569", fontSize: 9, ...MONO,
              borderRight: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{no}</div>
            <div style={{
              flex: "0 0 132px", padding: "5px 9px",
              color: "#64748b", fontSize: 10.5, ...UI,
              borderRight: "1px solid rgba(255,255,255,0.04)",
              lineHeight: 1.45,
            }}>{label}</div>
            <div style={{
              flex: 1, padding: "5px 9px",
              color: value?.startsWith("✓") ? "#6ee7b7" : "#e2e8f0",
              fontSize: 10.5, ...UI,
              fontWeight: value?.startsWith("✓") ? 600 : 400,
              lineHeight: 1.45,
            }}>{value || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function FarmersCard({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        zIndex: 200, backdropFilter: "blur(16px)",
        overflowY: "auto", padding: "24px 16px 48px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460,
          display: "flex", flexDirection: "column", gap: 14,
          animation: "popIn 0.38s cubic-bezier(0.34,1.56,0.64,1)",
          ...UI,
        }}
      >

        {/* ══ LABEL ══ */}
        <div style={{
          textAlign: "center", fontSize: 10, color: "#475569",
          letterSpacing: 3, textTransform: "uppercase",
        }}>
          ▲ সামনের দিক — সামনের পাতা
        </div>

        {/* ══════════════════════════════════════
            FRONT FACE
        ══════════════════════════════════════ */}
        <div style={{
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          minHeight: 252,
          background: "linear-gradient(152deg, #14532d 0%, #166534 28%, #15803d 60%, #16a34a 100%)",
          boxShadow: `
            0 32px 80px rgba(0,0,0,0.75),
            0 0 0 1.5px rgba(255,255,255,0.08),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          color: "white",
        }}>

          {/* Agricultural field scene */}
          <FieldScene/>

          {/* ── Content (above scene) ── */}
          <div style={{ position: "relative", zIndex: 1, padding: "20px 24px 20px" }}>

            {/* ROW 1: Govt branding + Title + Chip */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 9,
            }}>
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                {/* BD Emblem */}
                <div style={{ marginTop: 2 }}>
                  <BDEmblem size={28}/>
                </div>
                <div>
                  {/* Govt label */}
                  <div style={{
                    ...UI, fontSize: 8, letterSpacing: 2, opacity: 0.62, marginBottom: 2,
                  }}>
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                  </div>
                  <div style={{
                    ...MONO, fontSize: 7.5, letterSpacing: 1.5, opacity: 0.48, marginBottom: 6,
                  }}>
                    GOVT. OF BANGLADESH · DAE
                  </div>
                  {/* ★ MAIN TITLE — Noto Serif Bengali ★ */}
                  <div style={{
                    ...BN,
                    fontSize: 30, fontWeight: 900,
                    lineHeight: 1, letterSpacing: 0.5,
                    textShadow: "0 2px 14px rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.3)",
                    color: "#ffffff",
                  }}>
                    কৃষক কার্ড
                  </div>
                  <div style={{
                    ...UI, fontSize: 9.5, letterSpacing: 4.5,
                    opacity: 0.7, marginTop: 4, fontWeight: 600,
                  }}>
                    কৃষক কার্ড
                  </div>
                </div>
              </div>

              {/* Gold EMV Chip */}
              <div style={{ marginTop: 6 }}>
                <EMVChip/>
              </div>
            </div>

            {/* ★ TAGLINE — from PDF: "স্বপ্ন নয় বাস্তবতা এক সঙ্গে" ★ */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              marginBottom: 14, padding: "7px 10px",
              background: "rgba(0,0,0,0.18)",
              borderRadius: 7,
              border: "1px solid rgba(187,247,208,0.18)",
              backdropFilter: "blur(4px)",
            }}>
              <div style={{ width: 3, borderRadius: 3, background: "#6ee7b7", alignSelf: "stretch", flexShrink: 0 }}/>
              <div>
                <div style={{
                  ...BN,
                  fontSize: 12.5, fontStyle: "italic", fontWeight: 600,
                  color: "#bbf7d0", lineHeight: 1.4,
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}>
                  {FARMER.tagline}
                </div>
                <div style={{ ...UI, fontSize: 9, opacity: 0.45, marginTop: 2 }}>
                  motto — কৃষক কার্ড
                </div>
              </div>
            </div>

            {/* FARMER PHOTO + NAME */}
            <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 17 }}>
              {/* Photo box */}
              <div style={{
                width: 54, height: 64, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
                border: "1.5px solid rgba(255,255,255,0.3)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}>
                <div style={{ fontSize: 26 }}>👨‍🌾</div>
                <div style={{ ...MONO, fontSize: 7, opacity: 0.38, letterSpacing: 1 }}>ছবি</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...BN, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                  {FARMER.nameBn}
                </div>
                <div style={{ ...MONO, fontSize: 10.5, opacity: 0.58, marginBottom: 2 }}>
                  {FARMER.name}
                </div>
                <div style={{ ...MONO, fontSize: 9.5, opacity: 0.42 }}>
                  NID: {FARMER.nid}
                </div>
                <div style={{ ...UI, fontSize: 10, marginTop: 4, opacity: 0.68 }}>
                  <span style={{ opacity: 0.5 }}>পিতা: </span>
                  {FARMER.guardianName}
                </div>
                <div style={{ ...UI, fontSize: 10, marginTop: 2, opacity: 0.55 }}>
                  {FARMER.address.village}, {FARMER.address.upazila}, {FARMER.address.district}
                </div>
              </div>
            </div>

            {/* CARD NUMBER */}
            <div style={{
              ...MONO, fontSize: 20, letterSpacing: 5,
              marginBottom: 15, opacity: 0.97, fontWeight: 700,
              textShadow: "0 1px 10px rgba(0,0,0,0.4)",
            }}>
              {FARMER.cardNo}
            </div>

            {/* BOTTOM ROW: Valid / Category / Farmers Card label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ ...MONO, fontSize: 7.5, opacity: 0.42, letterSpacing: 1.5, marginBottom: 2 }}>
                  বৈধতার মেয়াদ
                </div>
                <div style={{ ...MONO, fontSize: 14, fontWeight: 700 }}>
                  {FARMER.validThru}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...UI, fontSize: 9, opacity: 0.48, marginBottom: 2 }}>শ্রেণী</div>
                <div style={{ ...BN, fontSize: 12, fontWeight: 700, color: "#bbf7d0" }}>
                  {FARMER.categoryBn}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 1, opacity: 0.9, marginBottom: 1 }}>
                  Farmers Card
                </div>
                <div style={{ ...MONO, fontSize: 8.5, opacity: 0.42 }}>
                  www.dae.gov.bd
                </div>
              </div>
            </div>

            {/* FOOTER STRIP */}
            <div style={{
              marginTop: 13, paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ ...UI, fontSize: 9, opacity: 0.42 }}>
                {FARMER.uniqueId}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <MagStripe/>
                <div style={{
                  background: "rgba(16,185,129,0.28)",
                  border: "1px solid rgba(16,185,129,0.52)",
                  borderRadius: 20, padding: "2px 11px",
                  ...UI, fontSize: 9, color: "#6ee7b7", fontWeight: 700, letterSpacing: 0.5,
                }}>
                  ✓ VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BACK LABEL ══ */}
        <div style={{
          textAlign: "center", fontSize: 10, color: "#475569",
          letterSpacing: 3, textTransform: "uppercase", marginTop: 2,
        }}>
          ▼ পিছনের দিক — পেছনের পাতা · ইলেকট্রনিক প্রোফাইল
        </div>

        {/* ══════════════════════════════════════
            BACK FACE — 33-field Electronic Profile
        ══════════════════════════════════════ */}
        <div style={{
          borderRadius: 18,
          background: "linear-gradient(160deg, #071812 0%, #0c1824 100%)",
          border: "1px solid rgba(16,185,129,0.18)",
          boxShadow: "0 12px 42px rgba(0,0,0,0.55)",
          padding: "18px 20px", color: "white",
          ...UI,
        }}>
          {/* Back header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14, paddingBottom: 11,
            borderBottom: "1px solid rgba(16,185,129,0.12)",
          }}>
            <div>
              <div style={{ ...BN, fontSize: 14.5, fontWeight: 800, color: "#6ee7b7" }}>
                কৃষকের ইলেকট্রনিক প্রোফাইল
              </div>
              <div style={{ ...UI, fontSize: 10, color: "#64748b", marginTop: 2 }}>
                কৃষকের ইলেকট্রনিক প্রোফাইল · তথ্য সংগৃহীত: BBS, DAE ও সরেজমিন মাঠ
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...MONO, fontSize: 8.5, color: "#475569" }}>{FARMER.uniqueId}</div>
              <div style={{ ...UI, fontSize: 8, color: "#334155", marginTop: 1 }}>{FARMER.issuedBy}</div>
            </div>
          </div>

          <ProfileSection
            title="১. ব্যক্তিগত ও পরিচয়" icon="👤"
            fields={[
              ["০১","কৃষক/কৃষাণীর নাম",FARMER.nameBn],
              ["০২","পিতা/মাতা/স্বামী/স্ত্রীর নাম",FARMER.guardianName],
              ["০৩","লিঙ্গ",FARMER.gender],
              ["০৪","ঠিকানা",`${FARMER.address.village}, ${FARMER.address.union}, ${FARMER.address.upazila}, ${FARMER.address.district}`],
              ["০৫","জাতীয় পরিচয়পত্র নম্বর",FARMER.nid],
              ["০৬","জন্ম তারিখ",FARMER.dob],
              ["০৭","বয়স",`${FARMER.age} বছর`],
              ["০৮","শিক্ষাগত যোগ্যতা",FARMER.education],
              ["০৯","অন্য পেশায় যুক্ত",FARMER.otherOccupation],
              ["১০","মোবাইল নম্বর",FARMER.mobile],
            ]}
          />
          <ProfileSection
            title="২. পারিবারিক ও ভৌগোলিক" icon="🏠"
            fields={[
              ["১১","পরিবারের সদস্য সংখ্যা",`${FARMER.familyMembers} জন`],
              ["১২","বাসার GPS লোকেশন",FARMER.gps],
            ]}
          />
          <ProfileSection
            title="৩. জমির মালিকানা ও চাষাবাদ" icon="🗺️"
            fields={[
              ["১৩","মোট জমি (শতাংশ)",`${FARMER.totalLand} শতাংশ`],
              ["১৪","মৌজা / দাগ নং / খতিয়ান",`${FARMER.landOwnership.mouza} · দাগ ${FARMER.landOwnership.dag} · খতিয়ান ${FARMER.landOwnership.khatian}`],
              ["১৫","মোট আবাদী জমি",`${FARMER.cultivableLand} শতাংশ`],
              ["১৬","কৃষকের শ্রেণী",FARMER.categoryBn],
              ["১৭","বর্গা নেওয়া জমি",`${FARMER.sharecropTaken} শতাংশ`],
              ["১৮","বর্গা দেওয়া জমি",`${FARMER.sharecropGiven} শতাংশ`],
              ["১৯","রবি মৌসুম ফসল",FARMER.crops.robi],
              ["  ","খরিপ-০১ মৌসুম",FARMER.crops.kharif1],
              ["  ","খরিপ-০২ মৌসুম",FARMER.crops.kharif2],
              ["২০","ফলবাগান / নার্সারি",FARMER.orchard],
            ]}
          />
          <ProfileSection
            title="৪. কৃষি উপকরণ ও আর্থিক" icon="💰"
            fields={[
              ["২১","ব্যবহৃত সার",FARMER.fertilizers],
              ["২২","বীজের উৎস",FARMER.seedSource],
              ["২৩","সেচ ব্যবস্থার ধরন",FARMER.irrigationType],
              ["২৪","প্রণোদনা / পুনর্বাসন",FARMER.incentive],
              ["২৫","কৃষি ঋণ (মৌসুমী)",FARMER.loan],
              ["২৬","কৃষি বীমা",FARMER.insurance],
              ["২৭","শস্য গুদাম সুবিধা",FARMER.warehouse],
            ]}
          />
          <ProfileSection
            title="৫. মৎস্য ও গবাদি পশু" icon="🐄"
            fields={[
              ["২৮","জলাশয়ের সংখ্যা ও আয়তন",`${FARMER.pondCount}টি · ${FARMER.pondArea}`],
              ["২৯","মাছ চাষকৃত জলাশয়",FARMER.fishArea],
              ["৩০","গবাদি পশুর সংখ্যা ও ধরন",FARMER.livestock],
              ["৩১","গবাদি পশু / পোল্ট্রি খামার",`${FARMER.farmCount}টি`],
            ]}
          />
          <ProfileSection
            title="৬. যাচাইকরণ" icon="✅"
            fields={[
              ["৩২","কৃষকের স্বাক্ষর",FARMER.signatureVerified ? "✓ সম্পন্ন" : "অসম্পূর্ণ"],
              ["৩৩","বায়োমেট্রিক ফিঙ্গারপ্রিন্ট",FARMER.biometricVerified ? "✓ স্ক্যান সম্পন্ন" : "অসম্পূর্ণ"],
              ["  ","ছবি","✓ তোলা হয়েছে"],
            ]}
          />
        </div>

        {/* Close */}
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.65)",
          borderRadius: 12, padding: "12px",
          cursor: "pointer", fontSize: 13, ...UI,
          transition: "background 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.11)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >
          বন্ধ করুন · Close  (Esc)
        </button>

      </div>
    </div>
  );
}
