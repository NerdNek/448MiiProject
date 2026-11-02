/** Colors from the Wii U FFL table in aboood40091/ffl `FFLiColor.cpp`. */
export type PaletteColor = {
  hex: string
  name: string
  hue: number
}

function color(r: number, g: number, b: number, name: string): PaletteColor {
  const hex = `#${[r, g, b]
    .map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0"))
    .join("")}`
  return { hex, name, hue: hueOf(hex) }
}

function hueOf(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16)
  const red = ((value >> 16) & 255) / 255
  const green = ((value >> 8) & 255) / 255
  const blue = (value & 255) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  if (delta === 0) return 0
  const hue =
    max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4
  return Math.round(((hue * 60) + 360) % 360)
}

/** The six faceline colors this renderer composites onto the face. */
export const facePalette: PaletteColor[] = [
  color(1, 0.827, 0.678, "Light"),
  color(1, 0.714, 0.42, "Peach"),
  color(0.87, 0.475, 0.259, "Tan"),
  color(1, 0.667, 0.549, "Rose"),
  color(0.678, 0.318, 0.161, "Brown"),
  color(0.388, 0.173, 0.094, "Deep"),
]

/** Eight shared hair, eyebrow, and facial-hair colors. */
export const hairPalette: PaletteColor[] = [
  color(0.118, 0.102, 0.094, "Black"),
  color(0.251, 0.125, 0.063, "Dark brown"),
  color(0.361, 0.094, 0.039, "Auburn"),
  color(0.486, 0.227, 0.078, "Brown"),
  color(0.471, 0.471, 0.502, "Gray"),
  color(0.306, 0.243, 0.063, "Olive"),
  color(0.533, 0.345, 0.094, "Golden brown"),
  color(0.816, 0.627, 0.29, "Blonde"),
]

/** Iris colors. The renderer stores one index, not a free hue. */
export const eyePalette: PaletteColor[] = [
  color(0, 0, 0, "Black"),
  color(0.424, 0.439, 0.439, "Gray"),
  color(0.4, 0.235, 0.173, "Brown"),
  color(0.376, 0.369, 0.188, "Hazel"),
  color(0.275, 0.329, 0.659, "Blue"),
  color(0.22, 0.439, 0.345, "Green"),
]

/** Six frame colors from the same FFL table. */
export const glassPalette: PaletteColor[] = [
  color(0.094, 0.094, 0.094, "Black"),
  color(0.376, 0.219, 0.062, "Brown"),
  color(0.658, 0.062, 0.031, "Red"),
  color(0.125, 0.188, 0.407, "Blue"),
  color(0.658, 0.376, 0, "Gold"),
  color(0.47, 0.439, 0.407, "Gray"),
]

export const mouthPalette: PaletteColor[] = [
  color(0.847, 0.322, 0.031, "Orange"),
  color(0.941, 0.047, 0.031, "Red"),
  color(0.961, 0.282, 0.282, "Pink"),
  color(0.941, 0.604, 0.455, "Light"),
  color(0.549, 0.314, 0.251, "Dark"),
]

export function paletteIndex(palette: PaletteColor[], hex: string) {
  const found = palette.findIndex((entry) => entry.hex.toLowerCase() === hex.toLowerCase())
  return found >= 0 ? found : 0
}
