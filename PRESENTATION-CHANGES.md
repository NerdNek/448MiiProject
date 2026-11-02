# Presentation notes — navigation and choice lists

These notes describe the local branch `improve/mii-save-a11y` after the uncommitted UI pass. They are not user-test results. The screenshots were taken in a desktop browser with Chrome viewport emulation, from `http://127.0.0.1:8456/`, on 2 Nov 2026.

The blue shape under the head is a simple stand-in torso. It is not Nintendo’s Wii body model.

## What changed

| Original problem | Change made | How it is meant to help | Evidence from this session |
| --- | --- | --- | --- |
| Ten category buttons crowded the top bar, and some labels were clipped. | Five labeled groups: Face, Hair, Eyes, Accessories, and Profile. The options inside the selected group appear on a second row. | Fewer choices in the first row, with the current group and option both visible. | `presentation/screenshots/before-1440-face.png` versus `after-1440-face.png`, both about 1440×900. |
| “Step X of 10” suggested a required order. | The breadcrumb now names the group and the option, such as Face · Nose. | People can open sections in any order. | Checked in the running app. Switching Face → Hair → Face returned to Nose after Nose had been selected. |
| Hair and eye color sat after a very long grid. | Color controls are above the choices. Hair, eyes, and mouths longer than 18 are shown 12 at a time, with Previous, Next, and Show selected. | The color and the current page stay reachable. Only the visible page is rendered. | `after-1440-hair.png`. The saved Mii recorded hair color 8 of 8 (index 7). |
| Eyebrow thumbnails were mostly hair. | Brow and eye thumbnails use a shorter hair (style 32) and a closer crop, still rendered by FFL. | The brow shape is easier to compare. | `after-1440-brows-v2.png`. Some neighboring brows still look similar at this size. |
| The footer keyboard line overlapped itself. | The hint wraps, and the labels are keyboard labels only. | The shortcuts can be read. | Visible in the 1440px after screenshots. Gamepad controls were not added. |

## Screenshots and slides

| File | Viewport | What it shows | Suggested slide |
| --- | --- | --- | --- |
| `presentation/screenshots/before-1440-face.png` | about 1440×900 | Ten-item top row before this pass | “The first row was doing too much.” |
| `presentation/screenshots/after-1440-face.png` | about 1440×900 | Grouped navigation and the face shapes | “Groups, then the option inside the group.” |
| `presentation/screenshots/after-1440-hair.png` | about 1440×900 | Hair color above a page of 12 hairstyles | “Color stays visible while browsing hair.” |
| `presentation/screenshots/after-1440-brows-v2.png` | about 1440×900 | Eyebrow thumbnails and the fine-tune panel | “Brows are adjusted separately from the eyes.” |
| `presentation/screenshots/after-1024-brows.png` | 1024×768 emulation | Preview and choices side by side; adjustments move below | “Tablet-width layout stacks the fine-tune panel.” |
| `presentation/screenshots/after-390-emulated.png` | 390×800 emulation, not a physical phone | Groups wrap. There is no second sideways-scrolling menu. | “Phone-width layout wraps the labels.” |
| `presentation/screenshots/after-1440x640.png` | 1440×640 emulation | Short desktop height. The page scrolls to the footer. | Optional, if you mention laptop height. |

## Slide bullets and speaker notes

**Navigation**

- Bullets: Five groups instead of ten top buttons. The second row shows only that group’s options. Sections are not a fixed sequence.
- Say: “I split the old row into Face, Hair, Eyes, Accessories, and Profile. Face still contains the face shape, nose, and mouth. If I leave Nose and come back to Face, Nose is still selected. The Mii itself does not reset.”

**Finding a hairstyle**

- Bullets: Hair color stays above the list. Twelve styles are shown at a time. The selected style stays marked.
- Say: “There are 132 hairstyles in this resource. Showing all of them at once pushed the color control off the page and rendered a lot of heads. The page now shows twelve, and the color control stays at the top.”

**Eyebrows**

- Bullets: Eyebrow position, spacing, size, and rotation are separate from the eyes. The thumbnails are still renders of those brow shapes.
- Say: “The old brow thumbnails were mostly hair. These are still the real brow meshes, drawn with a shorter hair so the shape is easier to see. I have not measured whether people pick the right one faster.”

**Saving**

- Bullets: Save Mii stores the character in this browser only. Restore brings it back after a refresh.
- Say: “I saved a Mii named Ada, refreshed, and restored it. The blonde hair, name, and March birthday came back. Nothing is uploaded.”

**What this does not prove**

- Bullets: No timed user test. No claim that the new layout is faster or fully accessible. No game controller.
- Say: “These changes are meant to make the choices easier to find. I have not run a user study, so I should not say they are faster or that everyone can use them.”

## Suggested user-test tasks

Ask these later. Do not fill in results you do not have.

1. Change the hairstyle and the hair color. Where did you look first?
2. Change only the eyebrows, then undo. Did the eyes change when you did not want them to?
3. Enter a name and a birthday, save, refresh, and restore. Was it clear that the save stays on this computer?
4. On a phone-sized window, find Glasses. Did any label require sideways scrolling?
5. Afterward: What was confusing? What would you leave as it is?

## Limits and what was not tested

- The 3D head is FFL.js with the Wii U shader and the local Miitomo resource. It is not the original Wii renderer. Without `public/ffl/asset/model/character/mii/AFLResHigh_2_3.dat`, the app uses the approximate preview. That file is gitignored. This session confirmed the file responds with HTTP 200 and the head rendered. I did not delete it to force the fallback.
- Colors are fixed lists: 6 skin, 8 hair, 6 eye, 5 mouth, and 6 glasses-frame colors.
- The torso under the head is a simple shape. It does not change with height or body settings, and it is not an original Wii model.
- Music plays only after Play music. The file is `public/ffl/music/mii-channel-editing.mp3` and is gitignored. I triggered the audio error handler without deleting the file; the button then read “Music unavailable.” A normal reload shows Play music again while the file is present.
- Phone and tablet screenshots used browser viewport emulation, not a physical device. Touch was not tested on a phone.
- Keyboard arrows moved focus in the automated browser. Ctrl+Z undid an eyebrow change and did not erase the name “Ada.” I did not complete every control with a physical keyboard only, because the browser tool’s Enter key does not activate buttons the way a real keyboard does. The controls are native buttons.
- Gamepad support is not implemented.
- The fork branch `improve/mii-save-a11y` on GitHub is not the same commit as this local work. Nothing from this pass was committed or pushed.

## Setup to mention

A teammate needs Node, `npm install`, and `npm run dev`. The 3D preview also needs the Miitomo resource at the path in the README. Optional music needs the mp3 path in the README. Credits for FFL.js, the Wii art, and the fonts are in `CREDITS.md`.
