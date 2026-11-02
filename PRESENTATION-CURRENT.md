# Mii Creator redesign — presentation notes

These notes describe the current prototype. They are intended as slide and speaking material, not as results of a formal usability study.

## Changes to discuss

| Problem or goal | Current implementation | Intended benefit |
| --- | --- | --- |
| Icon-only categories can be difficult to learn | Icon-and-text category navigation; contextual hints and section headings | Make feature categories easier to recognize |
| A long row can feel crowded | An earlier grouped layout was explored, but the team returned to the icon-and-label row | Retain the Wii-inspired category icons while keeping labels visible |
| Long lists can hide color controls | Color controls appear above paginated style grids; each page shows up to 12 choices | Make colors and style choices easier to reach |
| Brows could overlap eyes and be hard to distinguish | Updated default brow placement, separate eye/brow controls, and brow thumbnails without hair | Keep eyes visible and brow shapes easier to compare |
| Accidental edits need recovery | Undo, Redo and keyboard shortcuts; reset for supported adjustments | Let users reverse changes |
| Saving should survive refresh | Save and restore in browser-local storage | Preserve one Mii on the same browser and device |
| Preset color choice was limiting | Skin, hair and eye sliders interpolate between supported presets; labels display hex codes | Allow intermediate shades while keeping presets available |
| The preview should respond to choices | FFL.js head preview, a simple procedural torso, and drag-to-turn | See and inspect changes while editing |
| Actions need feedback | Optional Mii Channel sound samples play for selection, focus, adjustment, back and confirmation; effects and music have separate controls | Make actions more noticeable and support a Wii-inspired feel |
| Name and birthday entry can be cumbersome | Text input, on-screen keyboard and month/day menus | Offer familiar ways to enter profile details |

## Suggested slide bullets

- Labeled Wii-inspired category icons and contextual guidance.
- Paginated choices, visible color controls, and independent fine-tuning.
- Undo/Redo and browser-local save and restore.
- Intermediate skin, hair, and eye colors between renderer presets.
- Live Mii head preview, optional music, and independently mutable sound effects.

## Suggested speaker notes

> We started with the original Mii Channel and looked for ways to make editing easier to understand. We kept an icon-based layout and added labels, so the categories have both a familiar look and a text description.

> We moved color controls above long lists and divided large choice grids into pages. Eyebrow and eye adjustments are independent, and Undo lets someone recover from a selection.

> The Save button stores one Mii in this browser on this device, and Restore can bring it back after a refresh. The project is a local prototype, not a shared account system.

> We also added optional sound feedback to actions such as selecting, adjusting, going back, and saving. Sound effects can be muted separately from the background music. We chose the sample-to-action mapping; we have not verified Nintendo’s original mapping.

> Our preview uses FFL.js and a Miitomo resource, with an approximate torso. It is inspired by the Wii but does not use the original Wii renderer. Skin, hair, and eye colors blend between presets; some related facial-hair colors still use the nearest original shade.

## Evidence and limits

- TypeScript and production build checks can establish that the code compiles, not that the design is usable or accessible for everyone.
- Individual browser checks have covered parts of save/restore, controls, and the preview; verify the current version and device before making specific test claims.
- Do not claim measured improvements in speed or accessibility, or that a user study was conducted, without supporting study evidence.
- Gamepad input is not implemented. The fallback preview can approximate custom colors. The 3D head, optional music, and sound effects require local files excluded from Git; see the README and `CREDITS.md`. Sound effects are removed from production build output.
- The original sound sheet uses numbered samples. The action mapping is our selection and has not been confirmed against the original Wii. Cursor reported playback and mute checks; the final loudness and feel still need a human listening test.
- Any earlier screenshots showing grouped navigation or preset-only skin and eye colors are historical and do not represent the current interface. Capture fresh screenshots for the final slides.

## Suggested evaluation tasks

Ask teammates to find a hairstyle, change its color, move only the eyebrows, undo a change, and save and restore a Mii. Observe where they hesitate and ask what they expected; record actual results rather than predicting them.

## Placement in the current deck

- **Slide 6 — Before and after:** Replace the old “after” screenshot with a fresh current preview showing the labeled icon navigation.
- **Slide 7 — Design principles:** Mention visual feedback, optional sound feedback, and Undo/Redo. Do not claim sound is required or that accessibility is proven.
- **Slide 8 — Proposed improvements:** Say that skin, hair, and eye sliders interpolate between presets; gamepad support is not implemented.
- **Slide 9 — Live demo:** Show a feature selection, adjustment, Undo, save/restore, and optionally the sound mute control. Rehearse on the actual presentation machine.
- **Slide 11 — Contributions:** Describe Gaurav's prototype refinement, preview and control work, testing, credits, and AI-assisted development; respect the team's original work.
- **Slide 12 — Reflection:** Describe user testing and comparison with the original as next steps, unless results have actually been collected.
