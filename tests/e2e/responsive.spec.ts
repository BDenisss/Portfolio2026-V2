import { expect, test } from '@playwright/test'

const PAGES = ['/fr', '/en']

for (const path of PAGES) {
  test(`${path} : aucun scroll horizontal`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('page détail : aucun scroll horizontal', async ({ page }) => {
  await page.goto('/fr')
  const href = await page.getByTestId('project-card').first().getByRole('link').getAttribute('href')
  await page.goto(href!)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('nav desktop ≥ 768px / dock mobile < 768px', async ({ page, viewport }) => {
  await page.goto('/fr')
  const wide = viewport!.width >= 768
  await expect(page.getByTestId('dock')).toBeVisible({ visible: !wide })
  await expect(page.getByTestId('nav').getByRole('link', { name: 'Services' })).toBeVisible({
    visible: wide,
  })
})

const MIN_TARGET_PX = 44
// Une révélation en cours (translateY sub-pixel) arrondit la boîte à 43,99997 px pour une cible de 44 px CSS.
const SUBPIXEL_TOLERANCE_PX = 0.01

test('cibles tactiles principales ≥ 44px (dock, boutons, bascule de langue)', async ({
  page,
  viewport,
}) => {
  test.skip(viewport!.width >= 768, 'contrôle mobile')
  await page.goto('/fr')
  const targets = page.locator('[data-testid="dock"] a, [data-testid="lang-switch"] a, main button')
  for (const el of await targets.all()) {
    if (!(await el.isVisible())) continue
    const box = await el.boundingBox()
    expect(box!.height, await el.innerText()).toBeGreaterThanOrEqual(
      MIN_TARGET_PX - SUBPIXEL_TOLERANCE_PX,
    )
  }
})

test('le dock ne masque aucun contenu en bas de page (padding réservé)', async ({
  page,
  viewport,
}) => {
  test.skip(viewport!.width >= 768, 'contrôle mobile')
  await page.goto('/fr')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  // Le <footer> contient lui-même le padding réservé au dock : on mesure son contenu, pas sa boîte.
  const footerContent = page.locator('footer > *').last()
  const dock = page.getByTestId('dock')
  const fb = await footerContent.boundingBox()
  const db = await dock.boundingBox()
  expect(fb!.y + fb!.height).toBeLessThanOrEqual(db!.y + 1) // le pied de page reste au-dessus du dock
})
