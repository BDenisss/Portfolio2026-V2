import { expect, test } from '@playwright/test'

test('erreurs de validation sous chaque champ, accessibles', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  const name = form.getByLabel('Nom')
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(form.locator('[id$="-name-error"]')).toBeVisible()
  await expect(name).toBeFocused()
})

test('e-mail invalide signalé', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByLabel('Nom').fill('Ada Lovelace')
  await form.getByLabel('E-mail').fill('pas-un-email')
  await form.getByLabel('Message').fill('Bonjour, je voudrais discuter d’un projet.')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
})

test('la saisie est conservée après une erreur de validation', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByLabel('Nom').fill('Ada Lovelace')
  await form.getByLabel('E-mail').fill('pas-un-email')
  await form.getByLabel('Message').fill('Bonjour, je voudrais discuter d’un projet.')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
  await expect(form.getByLabel('Nom')).toHaveValue('Ada Lovelace')
  await expect(form.getByLabel('Message')).toHaveValue('Bonjour, je voudrais discuter d’un projet.')
})

test('envoi valide : message de succès annoncé (statut aria-live)', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByLabel('Nom').fill('Ada Lovelace')
  await form.getByLabel('E-mail').fill('ada@example.com')
  await form.getByLabel('Message').fill('Bonjour, je voudrais discuter d’un projet.')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByTestId('contact-status')).toContainText('Merci')
  await expect(page.getByTestId('contact-status')).toHaveAttribute('aria-live', 'polite')
  await expect(form.getByLabel('Nom')).toHaveValue('')
})

test('le champ piège n’est ni visible ni atteignable au clavier', async ({ page }) => {
  await page.goto('/fr#contact')
  const trap = page.locator('input[name="website"]')
  await expect(trap).toHaveAttribute('tabindex', '-1')
  await expect(trap).not.toBeInViewport()
})

test('coordonnées : e-mail affiché, téléphone absent par défaut', async ({ page }) => {
  await page.goto('/fr#contact')
  await expect(page.locator('#contact')).toContainText('bucspun.d@gmail.com')
  await expect(page.locator('#contact')).not.toContainText(/\+33|0[67] ?\d\d/)
})

test('EN : formulaire traduit', async ({ page }) => {
  await page.goto('/en#contact')
  const form = page.getByTestId('contact-form')
  await expect(form.getByRole('button', { name: 'Send message' })).toBeVisible()
  await expect(form.getByLabel('Name')).toBeVisible()
})
