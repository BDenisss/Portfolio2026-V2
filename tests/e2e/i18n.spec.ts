import { expect, test } from '@playwright/test'

test('/ redirige vers /fr pour un navigateur français', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'fr-FR' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/fr\/?$/)
  await ctx.close()
})

test('/ redirige vers /en pour un navigateur anglais', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'en-US' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/en\/?$/)
  await ctx.close()
})

test('la bascule de langue conserve la page et met à jour <html lang>', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await page.getByTestId('lang-switch').getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('#services h2')).toHaveText('Services')
})

test('EN : contenu CMS traduit (pas de repli FR sur le titre du hero)', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#hero')).toContainText('Full Stack Developer')
})

test('URL inconnue → 404 localisée', async ({ page }) => {
  const res = await page.goto('/fr/nimporte-quoi')
  expect(res?.status()).toBe(404)
})
