// Génère les icônes du site (favicon.ico, icon.png, apple-icon.png) à partir du logo rond.
// Usage : node scripts/media/make-favicon.mjs <logo.png>
// Le fond blanc autour du cercle devient transparent (remplissage depuis les bords) ; le blanc des lettres, entouré de noir, est conservé.
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const WHITE_THRESHOLD = 200
const APP_DIR = path.resolve('src/app')

async function transparentBackground(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const isLight = (index) =>
    data[index * 4] > WHITE_THRESHOLD &&
    data[index * 4 + 1] > WHITE_THRESHOLD &&
    data[index * 4 + 2] > WHITE_THRESHOLD
  const seen = new Uint8Array(width * height)
  const stack = []
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x)
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1)
  while (stack.length > 0) {
    const index = stack.pop()
    if (seen[index] || !isLight(index)) continue
    seen[index] = 1
    data[index * 4 + 3] = 0
    const x = index % width
    if (x > 0) stack.push(index - 1)
    if (x < width - 1) stack.push(index + 1)
    if (index >= width) stack.push(index - width)
    if (index < width * (height - 1)) stack.push(index + width)
  }
  return sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .png()
    .toBuffer()
}

/** Carré centré, fond transparent, avec une petite marge. */
const square = (logo, size, padding = 0) =>
  sharp(logo)
    .resize(size - padding * 2, size - padding * 2, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

/** ICO minimal qui embarque des PNG (format accepté par tous les navigateurs actuels). */
function toIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  const entries = []
  let offset = 6 + images.length * 16
  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buffer.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += buffer.length
    entries.push(entry)
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)])
}

const source = process.argv[2]
if (!source) throw new Error('Usage : node scripts/media/make-favicon.mjs <logo.png>')
const logo = await transparentBackground(source)
const icoSizes = [16, 32, 48]
const ico = toIco(
  await Promise.all(icoSizes.map(async (size) => ({ size, buffer: await square(logo, size) }))),
)
await writeFile(path.join(APP_DIR, 'favicon.ico'), ico)
await writeFile(path.join(APP_DIR, 'icon.png'), await square(logo, 512))
// L'icône Apple n'accepte pas la transparence (fond noir sinon) : fond blanc et marge.
const apple = await sharp(await square(logo, 180, 12))
  .flatten({ background: '#ffffff' })
  .png()
  .toBuffer()
await writeFile(path.join(APP_DIR, 'apple-icon.png'), apple)
console.log('favicon.ico, icon.png, apple-icon.png écrits dans', APP_DIR)
