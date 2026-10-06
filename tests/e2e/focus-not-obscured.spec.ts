import { expect, test, type Page } from '@playwright/test'

// WCAG 2.2 · 2.4.11 « Focus Not Obscured » : la nav fixe et le dock mobile ne doivent jamais recouvrir
// l'élément qui reçoit le focus clavier. Viewports explicites : un seul projet Playwright suffit.
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1024, height: 768 },
]
const MAX_TAB_STOPS = 160
const SETTLE_MS = 150

type Stop = { label: string; covered: boolean }

async function readFocusedStop(page: Page): Promise<Stop | null> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null
    if (!element || element === document.body) return null
    const box = element.getBoundingClientRect()
    // Une barre fixe ne « masque » pas ses propres liens : on ne compte que celles qui ne contiennent pas l'élément.
    const fixedBoxes = Array.from(
      document.querySelectorAll<HTMLElement>('nav, [data-glass="dock"]'),
    )
      .filter((node) => getComputedStyle(node).position === 'fixed' && !node.contains(element))
      .map((node) => node.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
    const covered = fixedBoxes.some(
      (rect) =>
        box.bottom > rect.top &&
        box.top < rect.bottom &&
        box.right > rect.left &&
        box.left < rect.right,
    )
    const label = (
      element.getAttribute('aria-label') ??
      element.textContent ??
      element.tagName
    ).trim()
    return { label: `${element.tagName.toLowerCase()} « ${label.slice(0, 40)} »`, covered }
  })
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'laptop', 'viewports explicites définis dans le test')
})

for (const viewport of VIEWPORTS) {
  test(`le focus clavier n'est jamais masqué par la nav ou le dock à ${viewport.width} px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    await page.goto('/fr')
    await page.waitForLoadState('networkidle')

    const hidden: string[] = []
    for (let stop = 0; stop < MAX_TAB_STOPS; stop++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(SETTLE_MS)
      const focused = await readFocusedStop(page)
      if (focused === null) break
      // Le lien d'évitement (premier arrêt) s'affiche volontairement par-dessus la nav.
      if (stop > 0 && focused.covered) hidden.push(focused.label)
    }
    await context.close()
    expect(hidden).toEqual([])
  })
}
