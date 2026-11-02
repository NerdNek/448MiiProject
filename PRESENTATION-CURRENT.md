# Mii Creator redesign — presentation notes

These notes describe the current prototype. They are intended as slide and speaking material, not as results of a formal usability study.

## A) Reference audit (verified vs Wii-inspired)

### Verified observations (from references + running app)

- **Top feature icons.** Official Nintendo UK support for creating and editing a Mii describes icons along the top for face features, body proportions, and accessories. Our app keeps a labeled icon row for Face → Profile. Sources: [Creating more Miis](https://www.nintendo.com/en-gb/Support/Legacy-system/Mii-Channel-Creating-more-Miis-242279.html), [Changing a Mii](https://www.nintendo.com/en-gb/Support/Legacy-system/Mii-Channel-Changing-a-Mii-242285.html).
- **Grid of style choices.** Contemporary write-ups of the Wii Mii Channel describe large grids of hairstyles, brows, eyes, and so on, with separate color choices. Our center panel uses paginated grids (12 per page when lists are long). Source summary: [Nintendo Wii Mii Channel overview](https://electronica.infonu.nl/spellen-en-consoles/72976-nintendo-wii-mii-channel.html).
- **Preset color icons.** The Channel used selectable color icons for favorites/skin/hair-style colors rather than a freeform hex field. Our presets remain circular swatches; Custom color is an addition.
- **Preview + controls layout.** Classic fan recreations place a live Mii with controls around it. We keep preview left, choices center, fine-tune right. Source: [Mii Editor “Classic” GUI preview](http://miieditor.blogspot.com/2007/01/classic-gui-preview.html).
- **Body silhouette.** Screenshots and gallery renders on [MiiWiki Mii Maker gallery](https://miiwiki.org/wiki/Mii_Maker/gallery) and Nintendo’s pants-color note show a short shirt-colored neck, steep shoulders, sleeves, round hands, and default gray trousers. Our handmade body follows those proportions by eye; it is not Nintendo’s mesh.

### Wii-inspired choices (not claimed as exact recreation)

- Pale aqua workspace, glossy tiles, cyan selection chrome.
- Compact prev/next **page dots** instead of a dense “1–12 of N” label (screen-reader text still announces page and range).
- Preset swatches **plus** HSB/custom hex for skin, hair, eyes, mouth, and glasses frames. Hex is the stored/edited value; the 3D shaded result is not guaranteed to match the swatch 1:1.
- Optional music and independently muted interface samples. Action→sample mapping is ours (see `CREDITS.md`), not verified Nintendo usage.
- Motion: short press/selection/section feedback; reduced to fades under `prefers-reduced-motion`.
- Labeled categories, Undo/Redo, browser-local Save/Restore, Nonbinary gender option, and on-screen name keyboard — usability additions for this class prototype.

**Do not claim** an exact Mii Channel recreation, measured speed gains, or a completed user study.

## Changes to discuss

| Problem or goal | Current implementation | Intended benefit |
| --- | --- | --- |
| Icon-only categories can be difficult to learn | Icon-and-text category navigation; hints on `aria-label` / `title` (not repeated under every icon) | Recognize categories without stacking hint text on every tile |
| Long lists hide color controls | Color controls above paginated style grids | Reach colors without scrolling past dozens of styles |
| “1–12 of 132” paging felt dense | Prev/next + page-dot indicators; SR live page summary; jump to selected when off-page | Browse every style with less chrome |
| Preset colors only | Presets + Custom color (HSB + native picker + visible hex) for skin/hair/eyes/mouth/frames | Intermediate shades while keeping familiar presets |
| Accidental edits | Undo/Redo (+ shortcuts); Reset on fine-tune | Recover quickly |
| Save across refresh | Browser-local save/restore | Keep one Mii on this device |
| Preview felt incomplete | FFL.js head + handmade body; drag-to-turn | Inspect changes live |
| Clutter (help cards, repeated tips) | Shorter section titles; removed duplicate tips/help card; keyboard strip retained | Same information density with less competing copy |

## Suggested slide bullets

- Labeled Wii-inspired category icons (hints available to AT / tooltip, not duplicated under each icon).
- Paginated choices with compact page dots; colors stay above long lists.
- Undo/Redo and browser-local save/restore.
- Preset swatches and custom HSB/hex for skin, hair, eyes, mouth, and glasses frames.
- Live FFL head preview on a handmade body; optional music; independently mutable sound effects.

## Suggested speaker notes

> We started from the Wii Mii Channel layout—top feature icons, a live preview, and grids of choices—and looked for places the class prototype could be clearer without pretending to be Nintendo’s editor.

> Color sits above long hairstyle and eye lists. Large lists use previous/next controls and page dots so you can reach every style without a dense “1–12 of N” label. Screen readers still hear the page and range.

> Save stores one Mii in this browser on this device. Restore brings it back after refresh. It is not an account system.

> Optional sound feedback uses local Mii Channel samples. Music and effects mute separately. Our sample-to-action mapping is not Nintendo’s verified mapping.

> The head uses FFL.js with a Miitomo resource. The body is handmade and Wii-inspired. Custom colors tint materials and textures; lighting and art still affect what you see. Hex is not a promise of a flat shaded match.

## Evidence and limits

- `npx tsc --noEmit` and `npm run build` establish that the code compiles. They do not prove usability or accessibility for everyone.
- Browser checks covered category nav, multi-page hair browsing, selection, custom color HSB, undo after a custom hue change, music vs mute independence, and layout at 1440×900, 1366×640, and 1024×800. Headless Chrome fell back to the 2D preview (no WebGL/resource); Cursor’s browser on localhost:8455 showed the 3D head when the local resource was present.
- Untested or only lightly checked: tablet/phone, projector, screen-reader full pass, gamepad, loudness of sounds, true reduced-motion on a physical OS setting during this pass (CSS hooks exist).
- Do not claim measured improvements in speed or accessibility without study evidence.
- Gamepad is not implemented. Production builds strip `ffl/sfx/`; music/resource remain local/gitignored.

## Wii body, motion, and surface pass (2 Nov 2026)

See earlier notes in this file’s history for the handmade body (`src/mii-body.ts`), short motion cues, and aqua/gloss chrome. Those behaviors remain: linked body rotation with the head, no blink/idle animation, no renderer replacement, reduced-motion fades.

## Visual refine pass (2 Nov 2026, evening)

### What changed and why

1. **Declutter.** Removed per-category hint lines under nav icons (kept `aria-label` + `title`), shortened section titles/subtitles, dropped repeating Tip/help-card copy, shortened save and fine-tune intros. Keyboard shortcut strip remains.
2. **Custom color.** Integrated panel: presets, palette slider, hex readout, collapsible HSB + native color input for skin/hair/eyes/mouth/glasses. Save/restore/undo/redo still apply. No claim that hex equals the shaded 3D result.
3. **Paging.** Replaced “1–12 of N” with ‹ › and page dots; `aria-live` page summary; “Selected” jump when the current style is on another page.
4. **Consistency.** Reused existing cyan/gloss tokens for pager dots and spectrum panel; no new design-system package or dependency.

### Screenshots

Folder: `presentation/screenshots/` (see `presentation/SCREENSHOTS.md`).

| File | Notes |
| --- | --- |
| `before-1440-face.png` | Historical before (earlier layout) |
| `wii-pass/*` | Body/surface pass before/after |
| `refine-pass/after-1440-overall-editor.png` | Overall editor after refine (Chrome headless; may show fallback preview) |
| `refine-pass/after-1440-hair-grid.png` | Large hair list + page dots |
| `refine-pass/after-1440-custom-color.png` | Custom color HSB open |
| `refine-pass/after-1366x640-laptop.png` | Short laptop height |
| `refine-pass/after-1024-narrow.png` | Narrow width |

Prefer Cursor/live screenshots when the 3D resource is loaded for the deck.

## Suggested evaluation tasks

Ask teammates to find a hairstyle, change its color with Custom color, move only the eyebrows, undo, and save/restore. Record actual hesitation—do not invent results.

## Placement in the current deck

- **Slide 6 — Before and after:** Use refine-pass overall + a labeled historical before.
- **Slide 7 — Design principles:** Feedback, optional sound, Undo/Redo; no proven a11y claims.
- **Slide 8 — Proposed improvements:** Custom color + page dots; gamepad not implemented.
- **Slide 9 — Live demo:** Feature select, custom color, Undo, save/restore, mute vs music.
- **Slide 11 — Contributions:** Gaurav’s refine pass, preview/body, docs, AI-assisted implementation with ChatGPT + Cursor; credit the team’s original Figma Make export and classmates’ work.
- **Slide 12 — Reflection:** User testing and Channel comparison as next steps unless real results exist.

## Custom color picker note

Hue, saturation, and brightness are adjustable; hex is visible and stored. The FFL pipeline recolors materials and face textures. Lighting, shading, and artwork affect the result. Some mouth styles have no colorable area. The fallback preview is approximate.
