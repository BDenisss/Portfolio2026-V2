import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

for (const path of ['/fr', '/en']) {
  test(`axe : 0 violation serious/critical sur ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)) // déclenche les .reveal
    await page.waitForTimeout(800)
    const bad = await scan(page)
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    ).toEqual([])
  })
}

test('axe : page détail projet', async ({ page }) => {
  await page.goto('/fr')
  const href = await page.getByTestId('project-card').first().getByRole('link').getAttribute('href')
  await page.goto(href!)
  expect(await scan(page)).toEqual([])
})

test('navigation clavier : tous les contrôles ont un focus visible', async ({ page }) => {
  await page.goto('/fr')
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return 'none'
      const s = getComputedStyle(el)
      return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? 'ok' : 'none'
    })
    expect(outline).toBe('ok')
  }
})
