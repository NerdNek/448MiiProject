# Setup guide (class ZIP)

This archive is for CECS 448 sharing. It may include **local Nintendo-derived resources** (Mii meshes, music, sound samples) that are **not** in the public Git repository. Do not redistribute publicly without checking licenses and course rules.

## Run

1. Extract the ZIP.
2. `npm install`
3. `npm run dev`
4. Open the Local URL (often `http://localhost:5173/` or the port Vite prints).

## Optional assets (if present under `public/ffl/`)

- `public/ffl/asset/.../AFLResHigh_2_3.dat` — 3D head + thumbnails
- `public/ffl/music/mii-channel-editing.mp3` — editor music
- `public/ffl/sfx/samples/Sample_*.wav` — interface sounds

Without them, the UI still runs with a fallback preview and unavailable audio buttons. See `CREDITS.md`.

## Checks

```bash
npx tsc --noEmit
npm run build
```

Production builds remove `dist/ffl/sfx/` on purpose.
