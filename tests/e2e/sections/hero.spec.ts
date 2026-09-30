import { expect, test } from '@playwright/test'

test.describe('hero', () => {
  test('affiche le nom, le titre et le cadre média', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('#hero h1')).toHaveText('Denis Bucspun')
    const frame = page.getByTestId('hero-frame')
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('data-hero-mode', /^(poster|orb|video|avatar3d)$/)
  })

  test('sans média : repli poster/orbe, pas de 3D', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.getByTestId('hero-frame')).toHaveAttribute('data-hero-mode', /^(poster|orb)$/)
  })

  test('chemin 3D avec la fixture (build NEXT_PUBLIC_E2E)', async ({ page }) => {
    test.skip(process.env.NEXT_PUBLIC_E2E !== '1', 'nécessite un build avec NEXT_PUBLIC_E2E=1')
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const external: string[] = []
    page.on('request', (request) => {
      if (!request.url().startsWith('http://localhost')) external.push(request.url())
    })
    await page.goto('/fr?__fixture=avatar')
    const frame = page.getByTestId('hero-frame')
    await expect(frame).toHaveAttribute('data-hero-mode', 'avatar3d')
    await expect(frame).toHaveAttribute('data-hero-ready', 'true', { timeout: 15_000 })
    await expect(frame.locator('canvas')).toBeVisible()
    expect(errors).toEqual([])
    expect(external.filter((url) => /gstatic|githubusercontent|raw\.github/.test(url))).toEqual([])
  })

  test('reduced-motion : contenu visible, mode statique', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/fr?__fixture=avatar')
    await expect(page.locator('#hero h1')).toBeVisible()
    await expect(page.getByTestId('hero-frame')).toHaveAttribute('data-hero-mode', /^(poster|orb)$/)
    await context.close()
  })

  test('les chips restent dans la fenêtre, sans scroll horizontal', async ({ page }) => {
    await page.goto('/fr')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    for (const chip of await page.getByTestId('hero-chip').all()) {
      const box = await chip.boundingBox()
      const viewport = page.viewportSize()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width)
    }
  })

  test('propose le téléchargement des deux CV dans un menu accessible', async ({ page }) => {
    await page.goto('/fr')
    const trigger = page.getByRole('button', { name: 'Télécharger mon CV' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('link', { name: 'CV Full Stack (PDF)' })).toHaveAttribute(
      'download',
      '',
    )
    await expect(page.getByRole('link', { name: 'CV IA / GenAI (PDF)' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })
})
