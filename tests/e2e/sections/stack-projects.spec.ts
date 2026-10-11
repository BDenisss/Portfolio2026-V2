import { expect, test } from '@playwright/test'

test('Stack : tuiles groupées par catégorie', async ({ page }) => {
  await page.goto('/fr')
  expect(await page.getByTestId('stack-tile').count()).toBeGreaterThanOrEqual(20)
  await expect(page.locator('#stack h3').first()).toBeVisible()
})

test('Projets : un carrousel de 3 projets, sans filtre', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.getByTestId('project-card')).toHaveCount(3)
  await expect(page.getByTestId('project-filter')).toHaveCount(0)
  await expect(page.getByRole('group', { name: 'Mes projets' })).toBeVisible()
})

test('Projets : les flèches et les points font défiler le carrousel', async ({ page }) => {
  await page.goto('/fr')
  const carousel = page.getByTestId('projects-carousel')
  await carousel.scrollIntoViewIfNeeded()
  const dots = carousel.getByRole('button', { name: /^Projet [0-9] sur 3$/ })
  await expect(dots.first()).toHaveAttribute('aria-current', 'true')
  await carousel.getByRole('button', { name: 'Projet suivant' }).click()
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
  await dots.nth(2).click()
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true')
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
