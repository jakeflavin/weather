/**
 * Writes the home-screen icons as PNGs.
 *
 * iOS ignores an SVG apple-touch-icon, so the PNGs have to exist as files. They are
 * generated here and committed rather than built, which keeps an image library out of the
 * dependency list for three small assets. Run `npm run icons` after changing the mark in
 * `public/favicon.svg`, and keep the two in step by hand — the mark is four rectangles.
 */
import { writeIcons } from './icon-png.mjs'

const OUT = new URL('../public/', import.meta.url)

const PAPER = [242, 241, 237]
const INK = [22, 24, 28]
const ACCENT = [210, 84, 42]

/** The mark, in fractions of the canvas: four bars under a rule. */
const BARS = [
  { x: 0.156, y: 0.594, w: 0.109, h: 0.25 },
  { x: 0.328, y: 0.438, w: 0.109, h: 0.406 },
  { x: 0.5, y: 0.25, w: 0.109, h: 0.594 },
  { x: 0.672, y: 0.469, w: 0.109, h: 0.375 },
]
const RULE = { x: 0.156, y: 0.125, w: 0.625, h: 0.031 }

const inside = (u, v, box) => u >= box.x && u < box.x + box.w && v >= box.y && v < box.y + box.h

function render(size) {
  const pixels = new Array(size * size)
  for (let y = 0; y < size; y++) {
    const v = (y + 0.5) / size
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size
      let rgb = PAPER
      if (inside(u, v, RULE)) rgb = ACCENT
      else if (BARS.some((bar) => inside(u, v, bar))) rgb = INK
      pixels[y * size + x] = rgb
    }
  }
  return pixels
}

for (const size of writeIcons(OUT, [180, 192, 512], render)) {
  console.log(`wrote icon-${size}.png`)
}
