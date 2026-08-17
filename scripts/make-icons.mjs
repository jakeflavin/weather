/**
 * Writes the home-screen icons as PNGs.
 *
 * iOS ignores an SVG apple-touch-icon, so the PNGs have to exist as files. They are
 * generated here and committed rather than built, which keeps an image library out of the
 * dependency list for three small assets. Run `npm run icons` after changing the mark in
 * `public/favicon.svg`, and keep the two in step by hand — the mark is four rectangles.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

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
  // Raw RGB rows, each prefixed with a zero filter byte — the simplest valid PNG scanline.
  const stride = size * 3 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    const row = y * stride
    raw[row] = 0
    const v = (y + 0.5) / size
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size
      let rgb = PAPER
      if (inside(u, v, RULE)) rgb = ACCENT
      else if (BARS.some((bar) => inside(u, v, bar))) rgb = INK
      const at = row + 1 + x * 3
      raw[at] = rgb[0]
      raw[at + 1] = rgb[1]
      raw[at + 2] = rgb[2]
    }
  }
  return raw
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function png(size) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(render(size), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [180, 192, 512]) {
  writeFileSync(new URL(`icon-${size}.png`, OUT), png(size))
  console.log(`wrote public/icon-${size}.png`)
}
