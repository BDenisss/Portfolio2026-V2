import { expect, test } from '@playwright/test'

test('/admin répond (connexion ou création du premier utilisateur)', async ({ page }) => {
  const res = await page.goto('/admin')
  expect(res?.status()).toBeLessThan(400)
  await expect(page.locator('body')).toContainText(/(Connexion|Se connecter|Créer|Login|Create)/i)
})

test('API publique : seulement des projets publiés, aucun message', async ({ request }) => {
  const projects = await request.get('/api/projects?limit=50')
  expect(projects.ok()).toBe(true)
  const body = await projects.json()
  for (const doc of body.docs) expect(doc._status).toBe('published')

  const messages = await request.get('/api/messages')
  expect([401, 403]).toContain(messages.status())
})

test('création publique interdite (users, messages, projects)', async ({ request }) => {
  for (const [path, data] of [
    ['/api/users', { email: 'x@y.co', password: 'Passw0rd!Passw0rd!' }],
    [
      '/api/messages',
      { name: 'A', email: 'a@b.co', topic: 'other', message: 'Bonjour, ceci est un test.' },
    ],
    ['/api/projects', { title: 'Pirate' }],
  ] as const) {
    const res = await request.post(path, { data })
    expect([401, 403], path).toContain(res.status())
  }
})
