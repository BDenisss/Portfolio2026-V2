import { expect, test } from '@playwright/test'

test('Parcours : timeline avec Bouygues en premier', async ({ page }) => {
  await page.goto('/fr')
  const items = page.getByTestId('timeline-item')
  expect(await items.count()).toBeGreaterThanOrEqual(4)
  await expect(items.first()).toContainText('Bouygues Telecom Business Solutions')
  await expect(page.locator('#journey')).toContainText(/oct\.? 2024/i)
})

test('Parcours : la formation IIM couvre 2024 – 2026', async ({ page }) => {
  await page.goto('/fr')
  const education = page.getByTestId('timeline-item').filter({ hasText: 'IIM Digital School' })
  await expect(education).toContainText(/sept\.? 2024/i)
  await expect(education).toContainText(/sept\.? 2026/i)
})

test('Parcours : détails repliables au clavier', async ({ page }) => {
  await page.goto('/fr')
  const first = page.getByTestId('timeline-item').first()
  const summary = first.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(first.locator('details')).toHaveAttribute('open', '')
})

const DRAWN = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/

test('Parcours : le rail se trace au scroll et chaque pastille apparaît quand il l’atteint', async ({
  page,
}) => {
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  const firstDot = page.locator('#journey [data-draw="dot"]').first()
  const lastLine = page.locator('#journey [data-draw="line"]').last()
  // Avant d'arriver au parcours : rien n'est tracé d'avance.
  await expect(firstDot).toHaveCSS('opacity', '0')
  await expect(lastLine).not.toHaveCSS('transform', DRAWN)
  // Le bas du parcours a dépassé le haut de l'écran : toute la ligne est tracée, les pastilles sont là.
  await page
    .locator('#journey')
    .evaluate((section) => window.scrollTo(0, section.getBoundingClientRect().bottom + scrollY))
  await expect(firstDot).toHaveCSS('opacity', '1')
  await expect(lastLine).toHaveCSS('transform', DRAWN)
})

test('Parcours reduced-motion : rail et pastilles visibles d’emblée', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/fr')
  const drawn = page.locator('#journey [data-draw]')
  expect(await drawn.count()).toBeGreaterThan(0)
  for (const element of await drawn.all()) {
    await expect(element).toHaveCSS('opacity', '1')
    await expect(element).toHaveCSS('transform', 'none')
  }
  await context.close()
})

test('Parcours EN : libellés traduits', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#journey h2')).toHaveText('My journey')
  await expect(page.getByTestId('timeline-item').first()).toContainText(
    'Full Stack & DevOps Developer',
  )
})

test('Méthode : 5 étapes numérotées', async ({ page }) => {
  await page.goto('/fr')
  const steps = page.getByTestId('process-step')
  await expect(steps).toHaveCount(5)
  await expect(steps.first()).toContainText('01')
  await expect(steps.last()).toContainText('05')
})
