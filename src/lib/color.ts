/** Small hex colour helpers for building chart palettes from a single accent. */

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`
}

/** Mixes a colour towards white. `amount` is 0 (unchanged) to 1 (white). */
export function tint(hex: string, amount: number) {
  const [r, g, b] = parse(hex)
  return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
}

const shades = [0, 0.35, 0.55, 0.7, 0.8, 0.88]

/**
 * A calm single-hue palette: the accent first, then progressively lighter
 * tints of it, so a themed dashboard stays light and on-brand.
 */
export function palette(accent: string, count: number) {
  if (count <= 2) return [accent, tint(accent, 0.62)].slice(0, count)
  return Array.from({ length: count }, (_, i) => tint(accent, shades[Math.min(i, shades.length - 1)]!))
}
