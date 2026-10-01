import { type Page, expect, test } from '@playwright/test'

const GLASS_CONTROLS = '[data-glass="pill"], [data-glass="dock"]'
const REDUCED_TRANSPARENCY = '(prefers-reduced-transparency: reduce)'
const NO_BACKDROP = 'none'
const BLUR = /blur\(/
const OPAQUE_ALPHA = 1
const COLOR_CHANNELS = /^rgba?\(([^)]*)\)$/
const CHANNEL_SEPARATOR = /[\s,/]+/
const ALPHA_INDEX = 3
const CHROMIUM = 'chromium'
const CDP_ONLY = 'émulation via CDP : Chromium uniquement'

type GlassMaterial = { readonly label: string; readonly backdrop: string; readonly alpha: number }

/** Alpha d'une couleur calculée (`rgb(…)` = opaque) ; NaN si le format est inattendu, pour échouer bruyamment. */
function alphaOf(color: string): number {
  const channels = COLOR_CHANNELS.exec(color)?.[1]?.split(CHANNEL_SEPARATOR).filter(Boolean)
  if (!channels) return Number.NaN
  return Number(channels[ALPHA_INDEX] ?? OPAQUE_ALPHA)
}

const isOpaqueFallback = ({ backdrop, alpha }: GlassMaterial): boolean =>
  backdrop === NO_BACKDROP && alpha === OPAQUE_ALPHA

const isFrostedGlass = ({ backdrop, alpha }: GlassMaterial): boolean =>
  BLUR.test(backdrop) && alpha < OPAQUE_ALPHA

async function readGlassControls(page: Page): Promise<GlassMaterial[]> {
  const styles = await page.locator(GLASS_CONTROLS).evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el)
      const label = el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName
      return { label, backdrop: style.backdropFilter, background: style.backgroundColor }
    }),
  )
  return styles.map(({ label, backdrop, background }) => ({
    label,
    backdrop,
    alpha: alphaOf(background),
  }))
}

type TransparencyPreference = 'reduce' | 'no-preference'

/**
 * Playwright 1.63 n'expose pas cette préférence dans `emulateMedia` : on passe par le protocole Chromium.
 * Toujours explicite, car Chromium sous Windows hérite du réglage système « Effets de transparence ».
 */
async function emulateTransparency(page: Page, value: TransparencyPreference): Promise<void> {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-transparency', value }],
  })
}

/** Garde-fou : sans cette vérification, une émulation ignorée rendrait les assertions vacantes. */
const prefersReducedTransparency = (page: Page): Promise<boolean> =>
  page.evaluate((query) => matchMedia(query).matches, REDUCED_TRANSPARENCY)

test('reduced-motion : tout le contenu est visible sans scroller', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/fr')
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1')
        .length,
  )
  expect(hidden).toBe(0)
  await ctx.close()
})

test('sans JavaScript : le contenu essentiel est présent et visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/fr')
  await expect(page.locator('h1')).toHaveText('Denis Bucspun')
  await expect(page.getByTestId('service-card').first()).toBeVisible()
  await expect(page.getByTestId('project-card').first()).toBeVisible()
  await ctx.close()
})

test('reduced-transparency : le verre des contrôles devient opaque et sans flou', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== CHROMIUM, CDP_ONLY)
  await emulateTransparency(page, 'reduce')
  await page.goto('/fr')
  expect(await prefersReducedTransparency(page)).toBe(true)
  const controls = await readGlassControls(page)
  expect(controls.length).toBeGreaterThan(0)
  expect(controls.filter((control) => !isOpaqueFallback(control))).toEqual([])
})

test('sans préférence : le verre des contrôles reste translucide et flouté', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== CHROMIUM, CDP_ONLY)
  await emulateTransparency(page, 'no-preference')
  await page.goto('/fr')
  expect(await prefersReducedTransparency(page)).toBe(false)
  const controls = await readGlassControls(page)
  expect(controls.length).toBeGreaterThan(0)
  expect(controls.filter((control) => !isFrostedGlass(control))).toEqual([])
})
