import { expect, test } from '@playwright/test'

test('Stack : tuiles groupées par catégorie', async ({ page }) => {
  await page.goto('/fr')
  expect(await page.getByTestId('stack-tile').count()).toBeGreaterThanOrEqual(20)
  await expect(page.locator('#stack h3').first()).toBeVisible()
})

test('Projets : filtre par technologie', async ({ page }) => {
  await page.goto('/fr')
  const cards = page.getByTestId('project-card')
  const total = await cards.count()
  expect(total).toBeGreaterThanOrEqual(3)
  await page.getByTestId('project-filter').getByRole('button', { name: 'PHP' }).click()
  await expect(cards).toHaveCount(1)
  await page.getByTestId('project-filter').getByRole('button', { name: 'Tout' }).click()
  await expect(cards).toHaveCount(total)
})

test('Projets : le filtre actif est annoncé (aria-pressed)', async ({ page }) => {
  await page.goto('/fr')
  const filter = page.getByTestId('project-filter')
  await expect(filter.getByRole('button', { name: 'Tout' })).toHaveAttribute('aria-pressed', 'true')
  await filter.getByRole('button', { name: 'PHP' }).click()
  await expect(filter.getByRole('button', { name: 'PHP' })).toHaveAttribute('aria-pressed', 'true')
  await expect(filter.getByRole('button', { name: 'Tout' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('Projets : la carte mène à la page détail, localisée', async ({ page }) => {
  await page.goto('/fr')
  await page.getByTestId('project-card').first().getByRole('link').click()
  await expect(page).toHaveURL(/\/fr\/projects\/[a-z0-9-]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: /Tous les projets/ })).toBeVisible()
})

test('Page projet : étude de cas, technologies et navigation', async ({ page }) => {
  await page.goto('/fr/projects/dywikis')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dywiki’s')
  await expect(page.getByRole('heading', { name: 'Étude de cas' })).toBeVisible()
  await expect(page.getByText('Intégration de l’API The Movie Database (TMDB).')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Projet (précédent|suivant)/ }).first()).toBeVisible()
})

test('Page projet EN : contenu traduit', async ({ page }) => {
  await page.goto('/en/projects/dywikis')
  await expect(page.getByRole('heading', { name: 'Case study' })).toBeVisible()
  await expect(page.getByText('Integration of The Movie Database (TMDB) API.')).toBeVisible()
})

test('Projet inconnu → 404', async ({ page }) => {
  const res = await page.goto('/fr/projects/n-existe-pas')
  expect(res?.status()).toBe(404)
})
