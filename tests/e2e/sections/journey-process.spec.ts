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

test('Parcours EN : libellés traduits', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#journey h2')).toHaveText('Experience & education')
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
