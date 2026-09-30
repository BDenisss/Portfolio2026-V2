import { expect, test } from '@playwright/test'

test('À propos : bio et statistiques', async ({ page }) => {
  await page.goto('/fr#about')
  await expect(page.locator('#about')).toContainText('Développeur Full Stack')
  const stats = page.getByTestId('stat-card')
  await expect(stats).toHaveCount(4)
  await expect(stats.first()).toContainText(/\d+\+/) // années calculées : ne jamais figer la valeur
})

test('À propos : les statistiques viennent du contenu (5 parcours dont 4 expériences, 4 projets)', async ({
  page,
}) => {
  await page.goto('/fr')
  const stats = page.getByTestId('stat-card')
  await expect(stats.nth(1)).toContainText('4')
  await expect(stats.nth(3)).toContainText('4')
})

test('Services : 4 cartes cliquables ≥ 44px', async ({ page }) => {
  await page.goto('/fr')
  const cards = page.getByTestId('service-card')
  await expect(cards).toHaveCount(4)
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded()
    const box = await card.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await expect(card.getByRole('heading', { level: 3 })).toBeVisible()
  }
})

test('EN : services traduits', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#services h2')).toHaveText('Services')
  await expect(page.locator('#services')).toContainText('Full Stack Development')
})
