// Standard Bangladeshi NID card aspect ratio (~ISO/IEC 7810 ID-1, 85.6 x 53.98mm).
// Shared by both the offline (pure-JS) pipeline and the optional OpenCV pipeline
// so a card always gets warped to the same output resolution regardless of
// which pipeline processed it.
const CARD_ASPECT = 85.6 / 53.98;
export const CARD_OUT_WIDTH = 1013;
export const CARD_OUT_HEIGHT = Math.round(CARD_OUT_WIDTH / CARD_ASPECT);
