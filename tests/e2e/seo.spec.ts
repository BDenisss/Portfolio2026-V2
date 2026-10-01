import { type APIRequestContext, expect, type Page, test } from '@playwright/test'

const LOCALES = ['fr', 'en'] as const
type Locale = (typeof LOCALES)[number]

async function firstProjectPath(request: APIRequestContext, locale: Locale): Promise<string> {
  const xml = await (await request.get('/sitemap.xml')).text()
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '')
  const projectUrl = locations.find((url) => url.includes(`/${locale}/projects/`))
  return new URL(projectUrl ?? '', 'http://unused.test').pathname
}

// `getAttribute` échoue si plusieurs balises correspondent : cela vérifie aussi l'unicité.
async function linkPathname(page: Page, selector: string): Promise<string> {
  const href = await page.locator(selector).getAttribute('href')
  return new URL(href ?? '', 'http://unused.test').pathname
}

test('robots.txt ferme /admin et /api aux robots et annonce le sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt')

  expect(response.status()).toBe(200)
  const body = await response.text()
  expect(body).toContain('Disallow: /admin')
  expect(body).toContain('Disallow: /api')
  expect(body).toMatch(/^Sitemap: \S+\/sitemap\.xml$/m)
})

test('sitemap.xml liste la home et au moins un projet dans chaque langue, avec leurs alternates', async ({
  request,
}) => {
  const response = await request.get('/sitemap.xml')

  expect(response.status()).toBe(200)
  const xml = await response.text()
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  for (const locale of LOCALES) {
    expect(
      locations.some((url) => url?.endsWith(`/${locale}`)),
      `home ${locale}`,
    ).toBe(true)
    expect(
      locations.some((url) => url?.includes(`/${locale}/projects/`)),
      `un projet en ${locale}`,
    ).toBe(true)
    expect(xml).toContain(`hreflang="${locale}"`)
  }
})

for (const locale of LOCALES) {
  test(`la home ${locale} porte un JSON-LD Person sans téléphone ni e-mail`, async ({ page }) => {
    await page.goto(`/${locale}`)

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent()
    const person = JSON.parse(raw ?? '')
    expect(person).toMatchObject({ '@context': 'https://schema.org', '@type': 'Person' })
    expect(person.name).toBeTruthy()
    expect(person.url).toMatch(new RegExp(`/${locale}$`))
    expect(person).not.toHaveProperty('telephone')
    expect(person).not.toHaveProperty('email')
  })
}

for (const locale of LOCALES) {
  test(`la page projet (${locale}) déclare son propre canonical et ses alternates hreflang, pas ceux de la home`, async ({
    page,
    request,
  }) => {
    const projectPath = await firstProjectPath(request, locale)
    const slug = projectPath.split('/').pop()

    await page.goto(projectPath)

    expect(await linkPathname(page, 'link[rel="canonical"]')).toBe(projectPath)
    for (const language of LOCALES) {
      expect(await linkPathname(page, `link[rel="alternate"][hreflang="${language}"]`)).toBe(
        `/${language}/projects/${slug}`,
      )
    }
  })
}
