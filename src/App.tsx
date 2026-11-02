import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FeatureThumb } from "./ffl-thumb"
import { fflCounts, getFflSession } from "./ffl/runtime"
import type { ThumbPart } from "./ffl/runtime"
import { eyePalette, facePalette, hairPalette, mouthPalette, type PaletteColor } from "./ffl/palette"
import { FflPreview } from "./ffl-preview"
import { maskedSprite } from "./masked-sprite"
import { MiiWebGLPreview, canUseWebGL } from "./mii-preview-3d"

type CategoryId = "face" | "hair" | "eyebrows" | "eyes" | "nose" | "mouth" | "glasses" | "facialHair" | "accessories" | "profile"

type MiiState = {
  faceShape: number
  skinTone: string
  hairStyle: number
  hairHue: number
  eyebrowStyle: number
  eyebrowY: number
  eyebrowX: number
  eyebrowSize: number
  eyebrowRotation: number
  eyeStyle: number
  eyeHue: number
  eyeY: number
  eyeX: number
  eyeSize: number
  eyeRotation: number
  noseStyle: number
  noseY: number
  noseSize: number
  mouthStyle: number
  mouthY: number
  mouthSize: number
  mouthColor: number
  glasses: number
  facialHair: number
  beardStyle: number
  accessory: number
  name: string
  month: number
  day: number
  gender: string
}

type History = {
  past: MiiState[]
  present: MiiState
  future: MiiState[]
}

const eyebrowDefaults = { eyebrowY: 12, eyebrowX: 4, eyebrowSize: 4, eyebrowRotation: 4 }
const eyeDefaults = { eyeY: 12, eyeX: 4, eyeSize: 4, eyeRotation: 4 }

const initialMii: MiiState = {
  faceShape: 0,
  skinTone: facePalette[1].hex,
  hairStyle: 33,
  hairHue: 1,
  eyebrowStyle: 6,
  ...eyebrowDefaults,
  eyeStyle: 0,
  eyeHue: 4,
  ...eyeDefaults,
  noseStyle: 0,
  noseY: 9,
  noseSize: 4,
  mouthStyle: 22,
  mouthY: 13,
  mouthSize: 4,
  mouthColor: 0,
  glasses: 0,
  facialHair: 0,
  beardStyle: 0,
  accessory: 0,
  name: "My Mii",
  month: 6,
  day: 12,
  gender: "Nonbinary",
}

const categories: { id: CategoryId; label: string; hint: string }[] = [
  { id: "face", label: "Face", hint: "Choose face shape and skin tone" },
  { id: "hair", label: "Hair", hint: "Browse hairstyles and colors" },
  { id: "eyebrows", label: "Brows", hint: "Shape and position eyebrows" },
  { id: "eyes", label: "Eyes", hint: "Change eyes, color, and placement" },
  { id: "nose", label: "Nose", hint: "Choose a nose shape" },
  { id: "mouth", label: "Mouth", hint: "Choose a smile and lip shape" },
  { id: "glasses", label: "Glasses", hint: "Add optional eyewear" },
  { id: "facialHair", label: "Facial hair", hint: "Add a beard or moustache" },
  { id: "accessories", label: "Extras", hint: "Add a beauty mark" },
  { id: "profile", label: "Profile", hint: "Name, birthday, and identity" },
]

const skinTones = facePalette.map((entry) => entry.hex)
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
function getDaysInMonth(month: number) {
  if (month === 2) return 29
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

const wiiIcon: Record<string, string> = {
  face: "/assets/wii/parts/p052.png",
  hair: "/assets/wii/parts/p072.png",
  eyebrows: "/assets/wii/parts/p146.png",
  eyes: "/assets/wii/parts/p178.png",
  nose: "/assets/wii/parts/p229.png",
  mouth: "/assets/wii/parts/p256.png",
  glasses: "/assets/wii/parts/p272.png",
  facialHair: "/assets/wii/parts/p245.png",
  accessories: "/assets/wii/parts/p290.png",
  profile: "/assets/wii/parts/p021.png",
}

function MaskedIcon({ src, size }: { src: string; size: number }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancel = false
    void maskedSprite(src).then((next) => {
      if (!cancel) setUrl(next)
    })
    return () => {
      cancel = true
    }
  }, [src])
  if (!url) return <span className="wii-icon" style={{ width: size, height: size }} />
  return (
    <img className="wii-icon" src={url} alt="" width={size} height={size} draggable={false} />
  )
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  if (wiiIcon[name]) return <MaskedIcon src={wiiIcon[name]} size={size} />
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  const paths: Record<string, React.ReactNode> = {
    face: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.7 10.5h.01M15.3 10.5h.01M9.3 15c1.7 1.3 3.7 1.3 5.4 0" />
      </>
    ),
    hair: (
      <>
        <path d="M5 13V9.7a7 7 0 0 1 14 0V13" />
        <path d="M5.5 10.5 8 6.6l1 3 2.4-4 1.4 3.2 2.4-3 3.3 4.7M7 13v5M17 13v5" />
      </>
    ),
    eyebrows: (
      <>
        <path d="M4.5 9c2.2-2 4.5-2 6.6-.5M19.5 9c-2.2-2-4.5-2-6.6-.5" />
        <path d="M7 13h.01M17 13h.01M9 17c2 1 4 1 6 0" />
      </>
    ),
    eyes: (
      <>
        <path d="M2.8 12s3.2-4 9.2-4 9.2 4 9.2 4-3.2 4-9.2 4-9.2-4-9.2-4Z" />
        <circle cx="12" cy="12" r="2.4" />
      </>
    ),
    nose: <path d="m12 4-2.2 10.5c-.3 1.5.8 2.5 2.2 2.5h2.5" />,
    mouth: (
      <>
        <path d="M4.5 9.5c2.8 1.3 4.4 1.3 7.5 0 3.1 1.3 4.7 1.3 7.5 0" />
        <path d="M5 10c1.3 5.2 4 7 7 7s5.7-1.8 7-7" />
      </>
    ),
    glasses: (
      <>
        <circle cx="7.5" cy="12" r="4" />
        <circle cx="16.5" cy="12" r="4" />
        <path d="M11.5 12h1M3.5 11 2 10M20.5 11l1.5-1" />
      </>
    ),
    facialHair: (
      <>
        <path d="M5 9.5C7.5 8 9.2 9 12 11c2.8-2 4.5-3 7-1.5-.3 3.3-2.3 4.7-7 2.2-4.7 2.5-6.7 1.1-7-2.2Z" />
        <path d="M8 14c.6 4 2 6 4 6s3.4-2 4-6" />
      </>
    ),
    accessories: (
      <>
        <path d="m12 3 1.7 4.7 5 .2-3.9 3 1.4 4.8-4.2-2.8-4.2 2.8 1.4-4.8-3.9-3 5-.2L12 3Z" />
        <path d="M6 19h12" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.7-4.2 3-6.3 7-6.3s6.3 2.1 7 6.3" />
      </>
    ),
    undo: <path d="M9 7 4 12l5 5M5 12h7.5a6 6 0 0 1 6 6" />,
    redo: <path d="m15 7 5 5-5 5M19 12h-7.5a6 6 0 0 0-6 6" />,
    back: <path d="m14.5 5-7 7 7 7" />,
    save: (
      <>
        <path d="M5 3h12l2 2v16H5V3Z" />
        <path d="M8 3v6h8V3M8 21v-7h8v7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    up: <path d="m6 15 6-6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    left: <path d="m15 6-6 6 6 6" />,
    right: <path d="m9 6 6 6-6 6" />,
    rotateLeft: <path d="M7 8H3V4M4 8a9 9 0 1 1-.5 7" />,
    rotateRight: <path d="M17 8h4V4M20 8a9 9 0 1 0 .5 7" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M5 12h14M12 5v14" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...common}
    >
      {paths[name] ?? paths.info}
    </svg>
  )
}

function MiiPreview({ mii }: { mii: MiiState }) {
  const hair = hairPalette[mii.hairHue] ?? hairPalette[0]
  const eye = eyePalette[mii.eyeHue] ?? eyePalette[0]
  const drawn = {
    ...mii,
    faceShape: mii.faceShape % 3,
    hairStyle: mii.hairStyle % 7,
    hairHue: hair.hue,
    eyebrowStyle: mii.eyebrowStyle % 2,
    eyeStyle: mii.eyeStyle % 3,
    eyeHue: eye.hue,
    eyeY: Math.round((9 - mii.eyeY) * 0.8),
    eyeX: Math.round((mii.eyeX - 6) * 0.7),
    eyeSize: 0.8 + (mii.eyeSize / 7) * 0.5,
    eyeRotation: (mii.eyeRotation - 4) * 3,
    noseStyle: mii.noseStyle % 3,
    mouthStyle: mii.mouthStyle % 3,
    glasses: Math.min(mii.glasses, 2),
    facialHair: Math.min(mii.facialHair, 2),
    accessory: Math.min(mii.accessory, 1),
  }
  mii = drawn
  const eyeColor = eye.hex
  const hairColor = hair.hex
  const eyeGap = 32 + mii.eyeX * 2.2
  const eyeY = 164 + mii.eyeY * 2
  const facePath =
    mii.faceShape === 1
      ? "M115 75 C58 82 49 130 60 204 C68 258 93 286 140 289 C187 286 212 258 220 204 C231 130 222 82 165 75Z"
      : mii.faceShape === 2
        ? "M140 73 C79 73 55 111 61 191 C66 256 99 290 140 290 C181 290 214 256 219 191 C225 111 201 73 140 73Z"
        : "M140 73 C85 73 55 111 61 190 C66 250 94 283 140 286 C186 283 214 250 219 190 C225 111 195 73 140 73Z"

  return (
    <svg
      className="mii-svg"
      viewBox="0 0 280 380"
      role="img"
      aria-label={`Live preview of ${mii.name}`}
    >
      <defs>
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26cbe2" />
          <stop offset="1" stopColor="#00a8c6" />
        </linearGradient>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="7"
            floodColor="#66878b"
            floodOpacity=".2"
          />
        </filter>
      </defs>
      <ellipse cx="140" cy="352" rx="89" ry="14" fill="#9eb5b8" opacity=".28" />
      <g filter="url(#softShadow)">
        <path d="M62 350c2-62 26-93 78-93s76 31 78 93Z" fill="url(#shirt)" />
        <path d="M112 260h56v43c-17 12-39 12-56 0Z" fill={mii.skinTone} />
        <path
          d={facePath}
          fill={mii.skinTone}
          stroke="#bc8c6a"
          strokeWidth="1.4"
        />

        {mii.hairStyle === 0 && (
          <path
            d="M66 151C48 93 79 53 139 53c60 0 90 39 76 96-9-24-21-41-38-51-15 14-35 23-62 27l8-24c-18 17-36 28-57 32Z"
            fill={hairColor}
          />
        )}
        {mii.hairStyle === 1 && (
          <path
            d="M63 147C49 86 82 50 141 51c58 1 86 39 74 99l-15-25-11 29-14-50-18 39-18-52-23 54-14-42-24 43-2-35Z"
            fill={hairColor}
          />
        )}
        {mii.hairStyle === 2 && (
          <>
            <path
              d="M63 152C50 94 76 58 140 56c62-2 91 37 76 96-18-27-43-43-76-43-34 0-59 16-77 43Z"
              fill={hairColor}
            />
            <path
              d="M69 128c15-35 40-53 75-53 31 0 53 14 69 43"
              fill="none"
              stroke="#fff"
              strokeOpacity=".12"
              strokeWidth="7"
            />
          </>
        )}
        {mii.hairStyle === 3 && (
          <path
            d="M83 116c10-45 40-62 82-56 41 6 59 37 49 88-14-25-31-40-52-48-24 18-50 27-79 26Z"
            fill={hairColor}
          />
        )}
        {mii.hairStyle === 4 && (
          <g fill={hairColor}>
            <ellipse cx="68" cy="103" rx="39" ry="52" transform="rotate(18 68 103)" />
            <ellipse cx="212" cy="103" rx="39" ry="52" transform="rotate(-18 212 103)" />
            <circle cx="92" cy="75" r="14" />
            <circle cx="188" cy="75" r="14" />
            <path d="M72 145C59 92 84 56 140 55c56 1 81 37 68 90-17-28-39-42-68-42s-51 14-68 42Z" />
            <path d="M108 70q32 19 64 0-8 38-32 44-24-6-32-44Z" />
          </g>
        )}
        {mii.hairStyle === 5 && (
          <g fill={hairColor}>
            <circle cx="72" cy="103" r="37" />
            <circle cx="91" cy="70" r="35" />
            <circle cx="126" cy="57" r="36" />
            <circle cx="162" cy="58" r="36" />
            <circle cx="194" cy="76" r="36" />
            <circle cx="209" cy="111" r="34" />
            <circle cx="75" cy="143" r="31" />
            <circle cx="205" cy="148" r="31" />
            <path d="M78 151C58 98 85 63 140 62c55 1 82 36 62 89-15-30-36-46-62-46s-47 16-62 46Z" />
          </g>
        )}
        {mii.hairStyle === 6 && (
          <g fill={hairColor}>
            <circle cx="91" cy="55" r="35" />
            <circle cx="189" cy="55" r="35" />
            <circle cx="91" cy="55" r="23" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="5" />
            <circle cx="189" cy="55" r="23" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="5" />
            <path d="M70 145C56 90 82 58 140 58s84 32 70 87c-18-27-42-41-70-41s-52 14-70 41Z" />
            <path d="M101 68q18 42 39 47 21-5 39-47-19 17-39 18-20-1-39-18Z" />
          </g>
        )}

        <g transform={`translate(0 ${mii.eyeY * 1.1})`}>
          {mii.eyebrowStyle === 0 && (
            <>
              <path
                d={`M${140 - eyeGap - 17} 147q17-10 34 0`}
                fill="none"
                stroke={hairColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d={`M${140 + eyeGap - 17} 147q17-10 34 0`}
                fill="none"
                stroke={hairColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </>
          )}
          {mii.eyebrowStyle === 1 && (
            <>
              <path
                d={`m${140 - eyeGap - 18} 149 34-10`}
                stroke={hairColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d={`m${140 + eyeGap - 16} 139 34 10`}
                stroke={hairColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </>
          )}
        </g>

        <g transform={`translate(0 ${eyeY - 164})`}>
          <g
            transform={`translate(${140 - eyeGap} 164) rotate(${-mii.eyeRotation}) scale(${mii.eyeSize})`}
          >
            {mii.eyeStyle === 2 ? (
              <path
                d="M-13 2q13-15 26 0-13 12-26 0Z"
                fill="#fff"
                stroke="#41575a"
                strokeWidth="2"
              />
            ) : (
              <ellipse
                rx={mii.eyeStyle === 1 ? 10 : 12}
                ry={mii.eyeStyle === 1 ? 16 : 10}
                fill="#fff"
                stroke="#41575a"
                strokeWidth="2"
              />
            )}
            <ellipse rx="4.8" ry="6" fill={eyeColor} />
            <circle r="2.4" fill="#172527" />
            <circle cx="-1.2" cy="-1.5" r="1" fill="#fff" />
          </g>
          <g
            transform={`translate(${140 + eyeGap} 164) rotate(${mii.eyeRotation}) scale(${mii.eyeSize})`}
          >
            {mii.eyeStyle === 2 ? (
              <path
                d="M-13 2q13-15 26 0-13 12-26 0Z"
                fill="#fff"
                stroke="#41575a"
                strokeWidth="2"
              />
            ) : (
              <ellipse
                rx={mii.eyeStyle === 1 ? 10 : 12}
                ry={mii.eyeStyle === 1 ? 16 : 10}
                fill="#fff"
                stroke="#41575a"
                strokeWidth="2"
              />
            )}
            <ellipse rx="4.8" ry="6" fill={eyeColor} />
            <circle r="2.4" fill="#172527" />
            <circle cx="-1.2" cy="-1.5" r="1" fill="#fff" />
          </g>
        </g>

        <g
          transform={`translate(140 ${200 + (mii.noseY - 9) * 2}) scale(${0.6 + mii.noseSize * 0.1}) translate(-140 -200)`}
        >
          {mii.noseStyle === 0 && (
            <path
              d="M139 178q-9 29 5 31"
              fill="none"
              stroke="#ad795f"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
          {mii.noseStyle === 1 && (
            <path
              d="M140 180c-7 14-8 25 0 29 8-4 7-15 0-29Z"
              fill="#dda888"
              stroke="#ad795f"
              strokeWidth="2"
            />
          )}
          {mii.noseStyle === 2 && (
            <circle
              cx="140"
              cy="201"
              r="9"
              fill="#dda888"
              stroke="#ad795f"
              strokeWidth="2"
            />
          )}
        </g>

        <g
          transform={`translate(140 ${232 + (mii.mouthY - 13) * 2}) scale(${0.6 + mii.mouthSize * 0.1}) translate(-140 -232)`}
        >
          {mii.mouthStyle === 0 && (
            <path
              d="M113 226q27 25 54 0"
              fill="none"
              stroke="#7e3737"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          {mii.mouthStyle === 1 && (
            <path
              d="M114 236q26-21 52 0"
              fill="none"
              stroke="#7e3737"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          {mii.mouthStyle === 2 && (
            <ellipse cx="140" cy="232" rx="24" ry="11" fill="#9c4d53" />
          )}
        </g>

        {mii.facialHair === 1 && (
          <path
            d="M112 218q28 14 56 0-5 18-28 11-23 7-28-11Z"
            fill={hairColor}
          />
        )}
        {mii.facialHair === 2 && (
          <path
            d="M105 234q35 32 70 0-4 49-35 53-31-4-35-53Z"
            fill={hairColor}
            opacity=".94"
          />
        )}

        {mii.glasses > 0 && (
          <g
            fill="none"
            stroke={mii.glasses === 2 ? "#00a6c3" : "#34484b"}
            strokeWidth="4"
          >
            <circle
              cx={140 - eyeGap}
              cy={eyeY}
              r={mii.glasses === 2 ? 22 : 19}
            />
            <circle
              cx={140 + eyeGap}
              cy={eyeY}
              r={mii.glasses === 2 ? 22 : 19}
            />
            <path d={`M${140 - eyeGap + 19} ${eyeY}h${eyeGap * 2 - 38}`} />
            <path
              d={`M${140 - eyeGap - 19} ${eyeY - 2}l-18-5M${140 + eyeGap + 19} ${eyeY - 2}l18-5`}
            />
          </g>
        )}
        {mii.accessory === 1 && (
          <g transform="translate(193 111) rotate(13)">
            <path
              d="m0-14 5 10 11 1-8 7 2 11-10-6-10 6 2-11-8-7 11-1Z"
              fill="#ffd651"
              stroke="#c99c19"
              strokeWidth="2"
            />
          </g>
        )}
        {mii.accessory === 2 && (
          <path
            d="M72 105q68-64 136 0l-15 14q-53-43-106 0Z"
            fill="#ea667b"
            stroke="#b94458"
            strokeWidth="2"
          />
        )}
      </g>
    </svg>
  )
}

function LiveMii({ mii }: { mii: MiiState }) {
  const [mode, setMode] = useState<"ffl" | "procedural" | "flat">(() =>
    canUseWebGL() ? "ffl" : "flat",
  )
  const [reason, setReason] = useState("")
  const useProcedural = useCallback((message: string) => {
    setReason(message)
    setMode("procedural")
  }, [])
  const useFlat = useCallback(() => setMode("flat"), [])
  if (mode === "flat") {
    return (
      <>
        <MiiPreview mii={mii} />
        <p className="preview-fallback">
          Drawing preview. This browser can't show the 3D view.
        </p>
      </>
    )
  }
  if (mode === "procedural") {
    return (
      <>
        <MiiWebGLPreview mii={mii} onUnavailable={useFlat} />
        <p className="preview-fallback">
          Approximate preview. {reason || "The FFL renderer is unavailable."}
        </p>
      </>
    )
  }
  return <FflPreview mii={mii} onUnavailable={useProcedural} />
}

function ChoiceGrid({
  count,
  selected,
  onSelect,
  type,
  part,
}: {
  count: number
  selected: number
  onSelect: (value: number) => void
  type: string
  part: ThumbPart
}) {
  return (
    <div className={count > 9 ? "choice-grid dense" : "choice-grid"}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          className={`feature-choice ${selected === index ? "selected" : ""}`}
          key={index}
          onClick={() => onSelect(index)}
          data-focusable
          aria-label={`${type} ${index + 1}`}
          aria-pressed={selected === index}
        >
          <span className={`mini-feature ${type}`}>
            <FeatureThumb part={part} index={index} />
          </span>
          {selected === index && (
            <span className="choice-check">
              <Icon name="check" size={13} />
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function ColorControl({
  value,
  onChange,
  palette,
  label,
}: {
  value: number
  onChange: (value: number) => void
  palette: PaletteColor[]
  label: string
}) {
  const selected = palette[value] ?? palette[0]
  return (
    <div className="color-control">
      <div className="control-label-row">
        <label htmlFor={`${label}-hue`}>{label}</label>
        <output>
          {selected.name} · {selected.hue}°
        </output>
      </div>
      <div className="hue-wrap">
        <input
          id={`${label}-hue`}
          className="hue-slider"
          type="range"
          min="0"
          max={palette.length - 1}
          step="1"
          value={Math.min(value, palette.length - 1)}
          onChange={(e) => onChange(Number(e.target.value))}
          data-focusable
          aria-label={`${label} hue`}
          style={{
            background: `linear-gradient(90deg, ${palette.map((entry) => entry.hex).join(", ")})`,
          }}
        />
        <span
          className="hue-thumb-preview"
          style={{
            background: selected.hex,
            left: `${(Math.min(value, palette.length - 1) / Math.max(1, palette.length - 1)) * 100}%`,
          }}
        />
      </div>
      <div className="swatch-row" aria-label={`${label} presets`}>
        {palette.map((entry, index) => (
          <button
            key={entry.hex}
            className={index === value ? "swatch active" : "swatch"}
            style={{ background: entry.hex }}
            onClick={() => onChange(index)}
            data-focusable
            aria-label={`Set ${label} to ${entry.name}, hue ${entry.hue} degrees`}
          />
        ))}
      </div>
      <p className="microcopy">
        {label} uses the {palette.length} colors this renderer supports. Each step changes the preview.
      </p>
    </div>
  )
}

function AdjustRow({
  label,
  value,
  min,
  max,
  step,
  leftIcon,
  rightIcon,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  leftIcon: string
  rightIcon: string
  onChange: (value: number) => void
}) {
  return (
    <div className="adjust-row">
      <div className="adjust-heading">
        <span>{label}</span>
        <output>{value > 0 ? `+${value}` : value}</output>
      </div>
      <div className="adjust-controls">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          data-focusable
          aria-label={`Decrease ${label}`}
        >
          <Icon name={leftIcon} size={17} />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          data-focusable
          aria-label={label}
        />
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          data-focusable
          aria-label={`Increase ${label}`}
        >
          <Icon name={rightIcon} size={17} />
        </button>
      </div>
    </div>
  )
}

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

export default function App() {
  const [category, setCategory] = useState<CategoryId>("face")
  const [history, setHistory] = useState<History>({
    past: [],
    present: initialMii,
    future: [],
  })
  const [fflRanges, setFflRanges] = useState<Awaited<ReturnType<typeof getFflSession>> | null>(null)
  useEffect(() => {
    let active = true
    void getFflSession().then((session) => { if (active) setFflRanges(session) }).catch(() => {})
    return () => { active = false }
  }, [])
  const [toast, setToast] = useState("")
  const toastTimer = useRef<number | undefined>(undefined)
  const mii = history.present

  const notify = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(""), 2200)
  }, [])

  const updateMii = useCallback(
    (changes: Partial<MiiState>, feedback?: string) => {
      setHistory((current) => {
        const next = { ...current.present, ...changes }
        if (JSON.stringify(next) === JSON.stringify(current.present))
          return current
        return {
          past: [...current.past, current.present].slice(-40),
          present: next,
          future: [],
        }
      })
      if (feedback) notify(feedback)
    },
    [notify],
  )

  const undo = useCallback(() => {
    setHistory((current) => {
      if (!current.past.length) return current
      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
    if (history.past.length) notify("Last change undone")
  }, [history.past.length, notify])

  const redo = useCallback(() => {
    setHistory((current) => {
      if (!current.future.length) return current
      const next = current.future[0]
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      }
    })
    if (history.future.length) notify("Change restored")
  }, [history.future.length, notify])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setCategory("face")
        notify("Back to Face")
        return
      }
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return
      const active = document.activeElement as HTMLElement | null
      if (active?.matches('input[type="range"], input[type="text"], select'))
        return
      const focusables = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-focusable]:not([disabled])",
        ),
      )
      if (!focusables.length) return
      if (!active || !focusables.includes(active)) {
        focusables[0].focus()
        event.preventDefault()
        return
      }
      const currentRect = active.getBoundingClientRect()
      const currentX = currentRect.left + currentRect.width / 2
      const currentY = currentRect.top + currentRect.height / 2
      const direction = event.key.replace("Arrow", "")
      const candidates = focusables
        .filter((item) => item !== active)
        .map((item) => {
          const rect = item.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          const dx = x - currentX
          const dy = y - currentY
          const valid =
            (direction === "Right" && dx > 4) ||
            (direction === "Left" && dx < -4) ||
            (direction === "Down" && dy > 4) ||
            (direction === "Up" && dy < -4)
          const primary =
            direction === "Right" || direction === "Left"
              ? Math.abs(dx)
              : Math.abs(dy)
          const secondary =
            direction === "Right" || direction === "Left"
              ? Math.abs(dy)
              : Math.abs(dx)
          return { item, valid, score: primary + secondary * 2.5 }
        })
        .filter((candidate) => candidate.valid)
        .sort((a, b) => a.score - b.score)
      if (candidates[0]) {
        event.preventDefault()
        candidates[0].item.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [notify, redo, undo])

  const activeCategory = useMemo(
    () => categories.find((item) => item.id === category)!,
    [category],
  )

  const appendName = (key: string) => {
    if (key === "backspace") updateMii({ name: mii.name.slice(0, -1) })
    else if (key === "space" && mii.name.length < 12)
      updateMii({ name: `${mii.name} ` })
    else if (mii.name.length < 12) updateMii({ name: `${mii.name}${key}` })
  }

  const renderCenter = () => {
    switch (category) {
      case "face":
        return (
          <>
            <SectionHeader
              title="Choose a face"
              subtitle="Start with a shape that feels like you."
            />
            <ChoiceGrid
              count={fflCounts.faceType}
              selected={mii.faceShape}
              onSelect={(faceShape) => updateMii({ faceShape })}
              type="face"
              part="face"
            />
            <div className="subsection">
              <h3>Skin tone</h3>
              <div className="large-swatches">
                {skinTones.map((tone) => (
                  <button
                    key={tone}
                    className={
                      mii.skinTone === tone
                        ? "skin-swatch active"
                        : "skin-swatch"
                    }
                    style={{ background: tone }}
                    onClick={() => updateMii({ skinTone: tone })}
                    data-focusable
                    aria-label={`Select skin tone ${tone}`}
                  >
                    {mii.skinTone === tone && <Icon name="check" size={17} />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      case "hair":
        return (
          <>
            <SectionHeader
              title="Choose a hairstyle"
              subtitle="Every style is available to every Mii."
            />
            <ChoiceGrid
              count={fflCounts.hairType}
              selected={mii.hairStyle}
              onSelect={(hairStyle) => updateMii({ hairStyle })}
              type="hair"
              part="hair"
            />
            <div className="subsection">
              <ColorControl
                value={mii.hairHue}
                onChange={(hairHue) => updateMii({ hairHue })}
                palette={hairPalette}
                label="Hair color"
              />
            </div>
          </>
        )
      case "eyebrows":
        return (
          <>
            <SectionHeader
              title="Choose eyebrows"
              subtitle="Add expression with a shape that suits your Mii."
            />
            <ChoiceGrid
              count={fflCounts.eyebrowType}
              selected={mii.eyebrowStyle}
              onSelect={(eyebrowStyle) => updateMii({ eyebrowStyle })}
              type="brows"
              part="brows"
            />
            <Tip>
              Adjust eyebrow position independently in the fine-tune panel. Their color matches the hair color.
            </Tip>
          </>
        )
      case "eyes":
        return (
          <>
            <SectionHeader
              title="Choose eyes"
              subtitle="Select a shape, then fine-tune it on the right."
            />
            <ChoiceGrid
              count={fflCounts.eyeType}
              selected={mii.eyeStyle}
              onSelect={(eyeStyle) => updateMii({ eyeStyle })}
              type="eyes"
              part="eyes"
            />
            <div className="subsection">
              <ColorControl
                value={mii.eyeHue}
                onChange={(eyeHue) => updateMii({ eyeHue })}
                palette={eyePalette}
                label="Eye color"
              />
            </div>
          </>
        )
      case "nose":
        return (
          <>
            <SectionHeader
              title="Choose a nose"
              subtitle="Simple, expressive shapes in classic Mii style."
            />
            <ChoiceGrid
              count={fflCounts.noseType}
              selected={mii.noseStyle}
              onSelect={(noseStyle) => updateMii({ noseStyle })}
              type="nose"
              part="nose"
            />
          </>
        )
      case "mouth":
        return (
          <>
            <SectionHeader
              title="Choose a mouth"
              subtitle="Give your Mii a little personality."
            />
            <ChoiceGrid
              count={fflCounts.mouthType}
              selected={mii.mouthStyle}
              onSelect={(mouthStyle) => updateMii({ mouthStyle })}
              type="mouth"
              part="mouth"
            />
            <div className="subsection">
              <ColorControl
                value={mii.mouthColor}
                onChange={(mouthColor) => updateMii({ mouthColor })}
                palette={mouthPalette}
                label="Mouth color"
              />
            </div>
          </>
        )
      case "glasses":
        return (
          <>
            <SectionHeader
              title="Choose glasses"
              subtitle="Optional eyewear for any look."
            />
            <ChoiceGrid
              count={fflCounts.glass}
              selected={mii.glasses}
              onSelect={(glasses) => updateMii({ glasses })}
              type="glasses"
              part="glasses"
            />
          </>
        )
      case "facialHair":
        return (
          <>
            <SectionHeader
              title="Choose facial hair"
              subtitle="Mix and match freely—there are no restrictions."
            />
            <h3 className="subsection-label">Moustache</h3>
            <ChoiceGrid
              count={fflCounts.mustache}
              selected={mii.facialHair}
              onSelect={(facialHair) => updateMii({ facialHair })}
              type="moustache"
              part="mustache"
            />
            <h3 className="subsection-label">Beard</h3>
            <ChoiceGrid
              count={fflCounts.beard}
              selected={mii.beardStyle}
              onSelect={(beardStyle) => updateMii({ beardStyle })}
              type="beard"
              part="beard"
            />
            <Tip>The first option in each row is none. Facial hair uses the hair color.</Tip>
          </>
        )
      case "accessories":
        return (
          <>
            <SectionHeader
              title="Add a beauty mark"
              subtitle="The resource includes a mole. Other extras are not in this renderer."
            />
            <ChoiceGrid
              count={fflCounts.mole}
              selected={mii.accessory > 0 ? 1 : 0}
              onSelect={(accessory) => updateMii({ accessory })}
              type="mole"
              part="mole"
            />
          </>
        )
      case "profile":
        return (
          <>
            <SectionHeader
              title="Your Mii's profile"
              subtitle="Name and identity details can be changed anytime."
            />
            <div className="name-field-wrap">
              <label htmlFor="mii-name">Mii name</label>
              <input
                id="mii-name"
                type="text"
                value={mii.name}
                maxLength={12}
                onChange={(e) => updateMii({ name: e.target.value })}
                data-focusable
              />
              <span>{mii.name.length}/12</span>
            </div>
            <div className="keyboard" aria-label="On-screen keyboard">
              {keyboardRows.map((row, rowIndex) => (
                <div className="keyboard-row" key={rowIndex}>
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => appendName(key)}
                      data-focusable
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              <div className="keyboard-row">
                <button
                  className="key-wide"
                  onClick={() => appendName("backspace")}
                  data-focusable
                >
                  Backspace
                </button>
                <button
                  className="key-space"
                  onClick={() => appendName("space")}
                  data-focusable
                >
                  Space
                </button>
                <button
                  className="key-confirm"
                  onClick={() => notify("Name confirmed")}
                  data-focusable
                >
                  <Icon name="check" size={16} /> Confirm
                </button>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img
            className="brand-wordmark"
            src="/assets/wii/ui/wordmark.png"
            alt=""
          />
          <div>
            <h1>Mii Creator</h1>
            <p>Create someone wonderfully you</p>
          </div>
        </div>
        <nav className="category-nav" aria-label="Customization categories">
          {categories.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? "category active" : "category"}
              onClick={() => setCategory(item.id)}
              title={item.hint}
              data-focusable
              aria-current={category === item.id ? "page" : undefined}
            >
              <Icon name={item.id} size={21} />
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </nav>
      </header>

      <section className="workspace">
        <aside className="preview-panel" aria-label="Mii live preview">
          <div className="panel-kicker">
            <span className="live-dot" />
            Live preview
          </div>
          <div className="preview-stage">
            <div className="preview-halo" />
            <LiveMii mii={mii} />
          </div>
          <div className="mii-nameplate">
            <strong>{mii.name || "Unnamed Mii"}</strong>
            <span>FFL preview · Wii U shader port</span>
          </div>
        </aside>

        <section className="customize-panel" aria-labelledby="section-title">
          <div className="category-breadcrumb">
            <Icon name={category} size={18} />
            <span>{activeCategory.label}</span>
            <i />
            Step {categories.findIndex((item) => item.id === category) + 1} of{" "}
            {categories.length}
          </div>
          {renderCenter()}
        </section>

        <aside className="adjust-panel" aria-label="Contextual adjustments">
          {category === "eyebrows" ? (
            <>
              <div className="adjust-title"><div><span className="eyebrow">Fine tune</span><h2>Eyebrow adjustments</h2></div><span className="context-icon"><Icon name="eyebrows" /></span></div>
              <p className="adjust-intro">Adjust eyebrows independently from the eyes.</p>
              {fflRanges ? <>
                <AdjustRow label="Vertical position" value={mii.eyebrowY} {...fflRanges.brows.y} step={1} leftIcon="down" rightIcon="up" onChange={(eyebrowY) => updateMii({ eyebrowY })} />
                <AdjustRow label="Spacing" value={mii.eyebrowX} {...fflRanges.brows.x} step={1} leftIcon="left" rightIcon="right" onChange={(eyebrowX) => updateMii({ eyebrowX })} />
                <AdjustRow label="Size" value={mii.eyebrowSize} {...fflRanges.brows.scale} step={1} leftIcon="minus" rightIcon="plus" onChange={(eyebrowSize) => updateMii({ eyebrowSize })} />
                <AdjustRow label="Rotation" value={mii.eyebrowRotation} {...fflRanges.brows.rotate} step={1} leftIcon="rotateLeft" rightIcon="rotateRight" onChange={(eyebrowRotation) => updateMii({ eyebrowRotation })} />
                <button className="reset-button" onClick={() => updateMii(eyebrowDefaults, "Eyebrow adjustments reset")} data-focusable>Reset eyebrow adjustments</button>
              </> : <p className="adjust-intro">Eyebrow adjustments require the FFL preview.</p>}
            </>
          ) : category === "eyes" ? (
            <>
              <div className="adjust-title">
                <div>
                  <span className="eyebrow">Fine tune</span>
                  <h2>Eye adjustments</h2>
                </div>
                <span className="context-icon">
                  <Icon name="eyes" />
                </span>
              </div>
              <p className="adjust-intro">
                These steps adjust the eyes independently from the eyebrows.
              </p>
              <AdjustRow
                label="Vertical position"
                value={mii.eyeY}
                min={0}
                max={fflCounts.eyeY - 1}
                step={1}
                leftIcon="down"
                rightIcon="up"
                onChange={(eyeY) => updateMii({ eyeY })}
              />
              <AdjustRow
                label="Spacing"
                value={mii.eyeX}
                min={0}
                max={fflCounts.eyeX - 1}
                step={1}
                leftIcon="left"
                rightIcon="right"
                onChange={(eyeX) => updateMii({ eyeX })}
              />
              <AdjustRow
                label="Size"
                value={mii.eyeSize}
                min={0}
                max={fflCounts.eyeScale - 1}
                step={1}
                leftIcon="minus"
                rightIcon="plus"
                onChange={(eyeSize) => updateMii({ eyeSize })}
              />
              <AdjustRow
                label="Rotation"
                value={mii.eyeRotation}
                min={0}
                max={fflCounts.eyeRotate - 1}
                step={1}
                leftIcon="rotateLeft"
                rightIcon="rotateRight"
                onChange={(eyeRotation) => updateMii({ eyeRotation })}
              />
              <button
                className="reset-button"
                onClick={() =>
                  updateMii(eyeDefaults, "Eye adjustments reset")
                }
                data-focusable
              >
                Reset eye adjustments
              </button>
            </>
          ) : category === "nose" ? (
            <>
              <div className="adjust-title"><div><span className="eyebrow">Fine tune</span><h2>Nose adjustments</h2></div><span className="context-icon"><Icon name="nose" /></span></div>
              <p className="adjust-intro">Adjust vertical position and size independently.</p>
              {fflRanges ? <>
                <AdjustRow label="Vertical position" value={mii.noseY} {...fflRanges.nose.y} step={1} leftIcon="up" rightIcon="down" onChange={(noseY) => updateMii({ noseY })} />
                <AdjustRow label="Size" value={mii.noseSize} {...fflRanges.nose.scale} step={1} leftIcon="minus" rightIcon="plus" onChange={(noseSize) => updateMii({ noseSize })} />
                <button className="reset-button" onClick={() => updateMii({ noseY: 9, noseSize: 4 }, "Nose adjustments reset")} data-focusable>Reset nose adjustments</button>
              </> : <p className="adjust-intro">Adjustments require the FFL preview.</p>}
            </>
          ) : category === "mouth" ? (
            <>
              <div className="adjust-title"><div><span className="eyebrow">Fine tune</span><h2>Mouth adjustments</h2></div><span className="context-icon"><Icon name="mouth" /></span></div>
              <p className="adjust-intro">Adjust vertical position and size independently.</p>
              {fflRanges ? <>
                <AdjustRow label="Vertical position" value={mii.mouthY} {...fflRanges.mouth.y} step={1} leftIcon="up" rightIcon="down" onChange={(mouthY) => updateMii({ mouthY })} />
                <AdjustRow label="Size" value={mii.mouthSize} {...fflRanges.mouth.scale} step={1} leftIcon="minus" rightIcon="plus" onChange={(mouthSize) => updateMii({ mouthSize })} />
                <button className="reset-button" onClick={() => updateMii({ mouthY: 13, mouthSize: 4 }, "Mouth adjustments reset")} data-focusable>Reset mouth adjustments</button>
              </> : <p className="adjust-intro">Adjustments require the FFL preview.</p>}
            </>
          ) : category === "profile" ? (
            <>
              <div className="adjust-title">
                <div>
                  <span className="eyebrow">Profile details</span>
                  <h2>Birthday</h2>
                </div>
                <span className="context-icon">
                  <Icon name="profile" />
                </span>
              </div>
              <div className="date-fields">
                <label>
                  <span>Month</span>
                  <select
                    value={mii.month}
                    onChange={(e) => {
                      const month = Number(e.target.value)
                      updateMii({
                        month,
                        day: Math.min(mii.day, getDaysInMonth(month)),
                      })
                    }}
                    data-focusable
                    aria-label="Birth month"
                  >
                    {monthNames.map((month, index) => (
                      <option value={index + 1} key={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Day</span>
                  <select
                    value={mii.day}
                    onChange={(e) => updateMii({ day: Number(e.target.value) })}
                    data-focusable
                    aria-label="Birth day"
                  >
                    {Array.from({ length: getDaysInMonth(mii.month) }, (_, index) => (
                      <option value={index + 1} key={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="birthday-summary">
                Birthday: <strong>{monthNames[mii.month - 1]} {mii.day}</strong>
              </p>
              <div className="profile-select">
                <label>Gender</label>
                <div className="gender-options" role="radiogroup" aria-label="Gender">
                  {["Male", "Female", "Nonbinary"].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      role="radio"
                      aria-checked={mii.gender === gender}
                      className={mii.gender === gender ? "selected" : ""}
                      onClick={() => updateMii({ gender })}
                      data-focusable
                    >
                      {mii.gender === gender && <Icon name="check" size={15} />}
                      {gender}
                    </button>
                  ))}
                </div>
                <p>This never limits which features you can use.</p>
              </div>
              <Tip>Your profile details are private to this prototype.</Tip>
            </>
          ) : (
            <>
              <div className="adjust-title">
                <div>
                  <span className="eyebrow">Quick help</span>
                  <h2>{activeCategory.label}</h2>
                </div>
                <span className="context-icon">
                  <Icon name={category} />
                </span>
              </div>
              <div className="help-card">
                <Icon name="info" size={25} />
                <div>
                  <strong>{activeCategory.hint}</strong>
                  <p>
                    Choose any option in the center panel. Your selection is
                    always reversible.
                  </p>
                </div>
              </div>
              <div className="navigation-help">
                <h3>Button navigation</h3>
                <div>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>
                  <kbd>←</kbd>
                  <kbd>→</kbd>
                  <span>Move focus</span>
                </div>
                <div>
                  <kbd className="wide">Enter</kbd>
                  <span>Select</span>
                </div>
                <div>
                  <kbd className="wide">Esc</kbd>
                  <span>Back</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </section>

      <footer className="bottom-bar">
        <div className="history-actions">
          <button
            onClick={undo}
            disabled={!history.past.length}
            data-focusable
            aria-label="Undo last change"
          >
            <Icon name="undo" size={20} />
            <span>Undo</span>
            <kbd>−</kbd>
          </button>
          <button
            onClick={redo}
            disabled={!history.future.length}
            data-focusable
            aria-label="Redo last change"
          >
            <Icon name="redo" size={20} />
            <span>Redo</span>
            <kbd>+</kbd>
          </button>
        </div>
        <div className="controller-guide">
          <span>
            <b className="dpad">✣</b> Move
          </span>
          <span>
            <b className="button-a">A</b> Select
          </span>
          <span>
            <b className="button-b">B</b> Back
          </span>
          <span className="keyboard-guide">Keyboard: arrows · Enter · Esc</span>
        </div>
        <div className="primary-actions">
          <button
            className="back-button"
            onClick={() => setCategory("face")}
            data-focusable
          >
            <Icon name="back" size={20} /> Back
          </button>
          <button
            className="save-button"
            onClick={() => notify(`${mii.name || "Your Mii"} was saved`)}
            data-focusable
          >
            <Icon name="save" size={20} /> Save Mii
          </button>
        </div>
      </footer>

      <div
        className={toast ? "toast visible" : "toast"}
        role="status"
        aria-live="polite"
      >
        <span>
          <Icon name="check" size={16} />
        </span>
        {toast}
      </div>
    </main>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="section-header">
      <h2 id="section-title">{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="tip">
      <Icon name="info" size={18} />
      <span>{children}</span>
    </div>
  )
}
