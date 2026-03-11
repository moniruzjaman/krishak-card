import { FARMER } from "../data";

/**
 * Faithful recreation of the Krishok Card design from the DAE concept paper.
 *
 * Front face references from PDF:
 *  - Green card body with embedded field/tractor landscape photo strip
 *  - "কৃষক কার্ড" large Bangla heading (top-left, white on green)
 *  - EMV chip (top-right, gold)
 *  - Tagline: "স্বপ্ন নয় বাস্তবতা এক সঙ্গে"
 *  - Card number: 1234 5678 9012 format
 *  - VALID THRU: 01/80
 *  - "Farmers Card" label (bottom-right)
 *  - Bangladesh govt emblem (top-left corner)
 *
 * Back face shows all 33 electronic profile fields from DAE profile form.
 */

export default function FarmersCard({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, backdropFilter: "blur(12px)",
        padding: "20px 16px",
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: 460, width: "100%",
        animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        display: "flex", flexDirection: "column", gap: 14,
      }}>

        {/* ── FRONT FACE ── */}
        <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", letterSpacing: 2, marginBottom: -6 }}>
          ▲ সামনের দিক (FRONT)
        </div>

        <div style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)",
          background: "linear-gradient(160deg, #166534 0%, #14532d 40%, #15803d 100%)",
          color: "white",
          position: "relative",
          minHeight: 220,
        }}>

          {/* ── Decorative field landscape strip (SVG, mimics the tractor photo on card) ── */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            overflow: "hidden", borderRadius: 18,
          }}>
            {/* Sky gradient */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(180deg, #1d4ed8 0%, #3b82f6 60%, #7dd3fc 100%)",
              opacity: 0.18,
            }} />
            {/* Green field rows */}
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                position: "absolute",
                top: `${38 + i * 7}%`,
                left: 0, right: 0,
                height: "5%",
                background: i % 2 === 0 ? "rgba(22,163,74,0.18)" : "rgba(4,120,87,0.12)",
                transform: `perspective(300px) rotateX(${15 + i * 4}deg)`,
              }} />
            ))}
            {/* Subtle vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 30% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
            }} />
          </div>

          {/* ── Card content ── */}
          <div style={{ position: "relative", zIndex: 1, padding: "20px 24px 18px" }}>

            {/* Row 1: Branding + Chip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                {/* Govt emblem strip */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 5,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10,
                  }}>🏛</div>
                  <div style={{ fontSize: 8, letterSpacing: 1.5, opacity: 0.75, fontFamily: "monospace" }}>
                    GOVT. OF BANGLADESH · DAE
                  </div>
                </div>
                {/* Main title */}
                <div style={{
                  fontSize: 26, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.1,
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}>কৃষক কার্ড</div>
                <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.7, marginTop: 2 }}>
                  FARMERS CARD
                </div>
              </div>

              {/* EMV Chip — gold, faithful to PDF */}
              <div style={{
                width: 46, height: 36,
                background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 40%, #d97706 80%, #f59e0b 100%)",
                borderRadius: 6,
                boxShadow: "0 3px 10px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
                gap: 2, padding: 5, flexShrink: 0,
              }}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} style={{
                    background: i === 4 ? "transparent" : "rgba(0,0,0,0.12)",
                    borderRadius: 1,
                    border: i === 4 ? "none" : "0.5px solid rgba(180,120,0,0.3)",
                  }} />
                ))}
              </div>
            </div>

            {/* Tagline — from PDF: "স্বপ্ন নয় বাস্তবতা এক সঙ্গে" */}
            <div style={{
              fontSize: 11, fontStyle: "italic", opacity: 0.85,
              marginBottom: 16, letterSpacing: 0.3,
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}>
              {FARMER.tagline}
            </div>

            {/* Farmer photo placeholder + name strip */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{
                width: 48, height: 58, borderRadius: 6, flexShrink: 0,
                background: "linear-gradient(160deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}>
                <div style={{ fontSize: 20 }}>👨‍🌾</div>
                <div style={{ fontSize: 7, opacity: 0.5, letterSpacing: 0.5 }}>PHOTO</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.3 }}>{FARMER.nameBn}</div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 1 }}>{FARMER.name}</div>
                <div style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace", marginTop: 3 }}>
                  NID: {FARMER.nid}
                </div>
                <div style={{ fontSize: 10, marginTop: 3 }}>
                  <span style={{ opacity: 0.5 }}>পিতা: </span>
                  <span style={{ opacity: 0.75 }}>{FARMER.guardianName}</span>
                </div>
              </div>
            </div>

            {/* Card number — matches PDF format 1234 5678 9012 */}
            <div style={{
              fontFamily: "monospace", fontSize: 18, letterSpacing: 5,
              marginBottom: 14, opacity: 0.95,
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
            }}>
              {FARMER.cardNo}
            </div>

            {/* Bottom row: Valid / Category / Land / Farmers Card label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 8, opacity: 0.5, letterSpacing: 1, marginBottom: 2 }}>VALID THRU</div>
                <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>{FARMER.validThru}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, opacity: 0.5, marginBottom: 2 }}>শ্রেণী / CATEGORY</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#bbf7d0" }}>{FARMER.categoryBn}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {/* "Farmers Card" label from PDF, bottom-right */}
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.85,
                  marginBottom: 2,
                }}>Farmers Card</div>
                <div style={{
                  fontSize: 9, opacity: 0.6, fontFamily: "monospace",
                }}>www.dae.gov.bd</div>
              </div>
            </div>

            {/* Unique ID strip */}
            <div style={{
              marginTop: 12, paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", opacity: 0.55 }}>
                {FARMER.uniqueId}
              </div>
              <div style={{
                background: "rgba(16,185,129,0.28)", border: "1px solid rgba(16,185,129,0.55)",
                borderRadius: 20, padding: "2px 10px", fontSize: 9,
                color: "#6ee7b7", fontWeight: 700, letterSpacing: 0.5,
              }}>✓ VERIFIED · DAE</div>
            </div>
          </div>
        </div>

        {/* ── BACK FACE — 33-field electronic profile ── */}
        <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", letterSpacing: 2, marginTop: 4 }}>
          ▼ পিছনের দিক — ইলেকট্রনিক প্রোফাইল (BACK · ELECTRONIC PROFILE)
        </div>

        <div style={{
          borderRadius: 16, overflow: "hidden",
          background: "#0f2017",
          border: "1px solid rgba(16,185,129,0.18)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          padding: "18px 20px",
          color: "white",
          fontSize: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6ee7b7", marginBottom: 14, letterSpacing: 0.5 }}>
            কৃষকের ইলেকট্রনিক প্রোফাইল · Electronic Profile
          </div>

          {/* Section grid */}
          {[
            {
              title: "১. ব্যক্তিগত তথ্য", icon: "👤",
              rows: [
                ["০১. নাম", FARMER.nameBn],
                ["০২. পিতা/মাতা", FARMER.guardianName],
                ["০৩. লিঙ্গ", FARMER.gender],
                ["০৪. ঠিকানা", `${FARMER.address.village}, ${FARMER.address.union}, ${FARMER.address.upazila}, ${FARMER.address.district}`],
                ["০৫. NID নম্বর", FARMER.nid],
                ["০৬. জন্ম তারিখ", FARMER.dob],
                ["০৭. বয়স", `${FARMER.age} বছর`],
                ["০৮. শিক্ষা", FARMER.education],
                ["০৯. অন্য পেশা", FARMER.otherOccupation],
                ["১০. মোবাইল", FARMER.mobile],
              ],
            },
            {
              title: "২. পারিবারিক ও ভৌগোলিক", icon: "🏠",
              rows: [
                ["১১. পরিবারের সদস্য", `${FARMER.familyMembers} জন`],
                ["১২. GPS লোকেশন", FARMER.gps],
              ],
            },
            {
              title: "৩. জমির তথ্য", icon: "🗺️",
              rows: [
                ["১৩. মোট জমি", `${FARMER.totalLand} শতাংশ`],
                ["১৪. মৌজা/দাগ/খতিয়ান", `${FARMER.landOwnership.mouza} / দাগ ${FARMER.landOwnership.dag} / খতিয়ান ${FARMER.landOwnership.khatian}`],
                ["১৫. আবাদী জমি", `${FARMER.cultivableLand} শতাংশ`],
                ["১৬. কৃষক শ্রেণী", FARMER.categoryBn],
                ["১৭. বর্গা নেওয়া", `${FARMER.sharecropTaken} শতাংশ`],
                ["১৮. বর্গা দেওয়া", `${FARMER.sharecropGiven} শতাংশ`],
                ["১৯. মৌসুমী ফসল রবি", FARMER.crops.robi],
                ["    খরিপ-০১", FARMER.crops.kharif1],
                ["    খরিপ-০২", FARMER.crops.kharif2],
                ["২০. ফলবাগান/নার্সারি", FARMER.orchard],
              ],
            },
            {
              title: "৪. উপকরণ ও আর্থিক", icon: "💰",
              rows: [
                ["২১. সার", FARMER.fertilizers],
                ["২২. বীজের উৎস", FARMER.seedSource],
                ["২৩. সেচ ব্যবস্থা", FARMER.irrigationType],
                ["২৪. প্রণোদনা/পুনর্বাসন", FARMER.incentive],
                ["২৫. কৃষি ঋণ", FARMER.loan],
                ["২৬. কৃষি বীমা", FARMER.insurance],
                ["২৭. শস্য গুদাম", FARMER.warehouse],
              ],
            },
            {
              title: "৫. মৎস্য ও গবাদি পশু", icon: "🐄",
              rows: [
                ["২৮. জলাশয় সংখ্যা/আয়তন", `${FARMER.pondCount}টি / ${FARMER.pondArea}`],
                ["২৯. মাছ চাষকৃত জলাশয়", FARMER.fishArea],
                ["৩০. গবাদি পশু", FARMER.livestock],
                ["৩১. খামার সংখ্যা", `${FARMER.farmCount}টি`],
              ],
            },
            {
              title: "৬. যাচাইকরণ", icon: "✅",
              rows: [
                ["৩২. কৃষকের স্বাক্ষর", FARMER.signatureVerified ? "✓ সম্পন্ন" : "অসম্পূর্ণ"],
                ["৩৩. বায়োমেট্রিক ফিঙ্গারপ্রিন্ট", FARMER.biometricVerified ? "✓ স্ক্যান সম্পন্ন" : "অসম্পূর্ণ"],
                ["    ছবি", "✓ তোলা হয়েছে"],
              ],
            },
          ].map((section, si) => (
            <div key={si} style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#94a3b8",
                marginBottom: 6, display: "flex", gap: 6, alignItems: "center",
              }}>
                <span>{section.icon}</span><span>{section.title}</span>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, overflow: "hidden",
              }}>
                {section.rows.map(([label, value], ri) => (
                  <div key={ri} style={{
                    display: "flex", gap: 8,
                    padding: "5px 10px",
                    borderBottom: ri < section.rows.length - 1
                      ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}>
                    <div style={{ color: "#64748b", minWidth: 145, flexShrink: 0, fontSize: 11 }}>{label}</div>
                    <div style={{
                      color: value?.startsWith("✓") ? "#6ee7b7" : "#e2e8f0",
                      fontWeight: value?.startsWith("✓") ? 600 : 400,
                      fontSize: 11,
                    }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Issuing authority */}
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", justifyContent: "space-between",
            fontSize: 10, color: "#475569",
          }}>
            <div>{FARMER.issuedBy}</div>
            <div style={{ fontFamily: "monospace" }}>{FARMER.uniqueId}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            borderRadius: 12, padding: "11px", cursor: "pointer",
            fontSize: 13, backdropFilter: "blur(6px)",
          }}
        >
          বন্ধ করুন · Close (Esc)
        </button>
      </div>
    </div>
  );
}
