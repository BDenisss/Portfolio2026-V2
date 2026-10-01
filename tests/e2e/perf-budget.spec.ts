import { expect, test } from '@playwright/test'

test('JS transféré avant idle ≤ 400 Ko et aucun chunk three/R3F sans média 3D', async ({
  page,
}) => {
  let bytes = 0
  const urls: string[] = []
  page.on('response', async (r) => {
    if (r.request().resourceType() !== 'script') return
    urls.push(r.url())
    bytes += Number(r.headers()['content-length'] ?? (await r.body()).length)
  })
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  expect(bytes).toBeLessThanOrEqual(400_000)
  const hasThree = await page.evaluate(() =>
    performance.getEntriesByType('resource').some((e) => /three|drei|fiber/.test(e.name)),
  )
  expect(hasThree).toBe(false)
})

// Créer un contexte WebGL attend le processus GPU de façon synchrone : pendant le premier rendu, Lighthouse
// mesurait une tâche longue de ~700 ms pour une sonde dont le résultat ne sert à rien sans modèle 3D.
test('aucun contexte WebGL créé au chargement sans média 3D', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    const probe = window as unknown as { webglContexts: number }
    probe.webglContexts = 0
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes('webgl')) probe.webglContexts += 1
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  const webglContexts = await page.evaluate(
    () => (window as unknown as { webglContexts: number }).webglContexts,
  )
  expect(webglContexts).toBe(0)
})
