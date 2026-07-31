# Immerli design QA

Status: **Passed for the responsive web slice**

## Visual target

- Source corpus: `screens/` (65 LingQ reference captures supplied by the user)
- Primary reader comparison: `screens/Capture d’écran 2026-07-30 à 05.20.58.png`
- Current landing-page structure was also checked against the live LingQ desktop hero captured in the user-selected in-app browser.

## Verified states

- Desktop landing page and authentication at 1279 × 720
- Authenticated dashboard and lesson library at 1279 × 720
- Desktop reader with the translation drawer at 1279 × 720
- Mobile reader and bottom-sheet translation panel in a 390 × 700 iframe viewport
- Import → tokenized lesson → translate → save vocabulary journey

## Comparison result

The Immerli reader preserves the reference’s important interaction geometry: distraction-free reading canvas, persistent lesson header, word-state highlighting, right-side translation workspace, and bottom listening controls. The implementation intentionally uses Immerli’s own typography, teal/orange palette, copy, iconography, and original assets.

Visible issues found and fixed during the combined reference/prototype comparison:

- Removed extra spacing around punctuation tokens.
- Corrected unreliable translation ranking by preferring repeated high-quality dictionary matches.
- Replaced a clipped mobile drawer with a responsive bottom sheet.
- Removed fake premium, currency, dictionary, and translation controls.
- Increased interactive targets to at least 44 px and added keyboard focus treatment.

## Remaining release QA

Native iOS/Android packaging and hosted Supabase/Vercel configuration require their separate release checks after the cloud project is authorized.
