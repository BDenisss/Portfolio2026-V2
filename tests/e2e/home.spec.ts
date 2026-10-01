import { expect, test } from '@playwright/test'

const IDS = ['hero', 'about', 'services', 'stack', 'projects', 'journey', 'process', 'contact']

test('les 8 sections sont présentes, dans l’ordre du contrat', async ({ page }) => {
  await page.goto('/fr')
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
  expect(ids).toEqual(IDS)
})

test('chaque section porte un titre accessible (aria-labelledby résolu)', async ({ page }) => {
  await page.goto('/fr')
  for (const id of IDS) {
    const labelledBy = await page.locator(`#${id}`).getAttribute('aria-labelledby')
    if (id === 'hero' || labelledBy) {
      const target = await page.locator(`#${labelledBy ?? 'hero-title'}`).count()
      expect(target, `titre de #${id}`).toBe(1)
    }
  }
})

test('un seul h1, titres hiérarchisés', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.locator('h1')).toHaveCount(1)
})

test('le lien d’évitement mène au contenu principal', async ({ page }) => {
  await page.goto('/fr')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Aller au contenu' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})

test('métadonnées : title, description, canonical, hreflang', async ({ page }) => {
  await page.goto('/fr')
  await expect(page).toHaveTitle(/Denis Bucspun/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
})
