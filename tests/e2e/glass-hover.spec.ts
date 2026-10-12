import { type Locator, type Page, expect, test } from '@playwright/test'

type GlassState = { lit: boolean; transform: string }

const stateOf = (glass: Locator): Promise<GlassState> =>
  glass.evaluate((element: HTMLElement) => ({
    lit: element.dataset.glassLit !== undefined,
    transform: getComputedStyle(element).transform,
  }))

/** Place la souris dans l'élément, en fraction de sa largeur et de sa hauteur. */
async function pointAt(page: Page, glass: Locator, ratioX: number, ratioY: number): Promise<void> {
  await glass.scrollIntoViewIfNeeded()
  const box = await glass.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width * ratioX, box!.y + box!.height * ratioY, { steps: 5 })
}

test('verre vivant : les petits éléments s’étirent vers la souris, les grandes cartes n’ont que le reflet', async ({
  page,
}) => {
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  const stat = page.getByTestId('stat-card').first()
  await pointAt(page, stat, 0.95, 0.5)
  await expect.poll(async () => (await stateOf(stat)).lit).toBe(true)
  await expect.poll(async () => (await stateOf(stat)).transform).toMatch(/^matrix\(1\.0[1-5]/)

  const service = page.getByTestId('service-card').first()
  await pointAt(page, service, 0.3, 0.4)
  await expect.poll(async () => (await stateOf(service)).lit).toBe(true)
  expect((await stateOf(service)).transform).toBe('none')
  // La souris est partie : la petite carte s'éteint et revient au repos.
  await expect.poll(() => stateOf(stat)).toEqual({ lit: false, transform: 'none' })
})

test('clic liquide : une onde part du point touché et le petit bouton rebondit', async ({
  page,
}) => {
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  const cv = page.getByRole('link', { name: 'Télécharger mon CV' })
  const scaleOf = (): Promise<number> =>
    cv.evaluate((element) => Number(getComputedStyle(element).scale))
  await pointAt(page, cv, 0.3, 0.5)
  await page.mouse.down()
  await expect(cv.locator('.glass-ripple')).toHaveCount(1)
  await expect.poll(scaleOf).toBeLessThan(1)
  await page.mouse.up()
  // L'onde s'éteint, sa couche disparaît et le bouton retrouve sa taille.
  await expect(cv.locator('.glass-ripple')).toHaveCount(0, { timeout: 5_000 })
  expect(await cv.evaluate((element) => element.style.scale)).toBe('')
})

test('verre vivant sous reduced-motion : ni reflet ni étirement', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  const stat = page.getByTestId('stat-card').first()
  await pointAt(page, stat, 0.95, 0.5)
  await page.waitForTimeout(500)
  expect(await stateOf(stat)).toEqual({ lit: false, transform: 'none' })
  await context.close()
})
