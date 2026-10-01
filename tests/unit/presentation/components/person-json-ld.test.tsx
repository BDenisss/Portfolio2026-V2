import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PersonJsonLd } from '@/presentation/components/seo/PersonJsonLd'
import { aSiteProfile } from '../../../support/builders'

const SCRIPT_PATTERN = /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/

function renderPayload(element: React.ReactElement): {
  raw: string
  data: Record<string, unknown>
} {
  const markup = renderToStaticMarkup(element)
  const raw = SCRIPT_PATTERN.exec(markup)?.[1] ?? ''
  return { raw, data: JSON.parse(raw) as Record<string, unknown> }
}

afterEach(() => vi.unstubAllEnvs())

describe('<PersonJsonLd>', () => {
  it('décrit Denis comme une Person schema.org avec son titre et l’URL de la page', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://denis.example')
    const site = aSiteProfile({ name: 'Denis Bucspun', jobTitle: 'Développeur Full Stack' })

    const { data } = renderPayload(<PersonJsonLd site={site} locale="en" />)

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Denis Bucspun',
      jobTitle: 'Développeur Full Stack',
      url: 'https://denis.example/en',
    })
  })

  it('reprend LinkedIn et GitHub dans sameAs, et rien d’autre', () => {
    const site = aSiteProfile({
      contact: {
        email: null,
        phone: null,
        showPhone: false,
        linkedin: 'https://www.linkedin.com/in/denis',
        github: 'https://github.com/BDenisss',
      },
    })

    const { data } = renderPayload(<PersonJsonLd site={site} locale="fr" />)

    expect(data.sameAs).toEqual([
      'https://www.linkedin.com/in/denis',
      'https://github.com/BDenisss',
    ])
  })

  it('omet les profils non renseignés', () => {
    const site = aSiteProfile({
      contact: {
        email: null,
        phone: null,
        showPhone: false,
        linkedin: null,
        github: 'https://github.com/BDenisss',
      },
    })

    const { data } = renderPayload(<PersonJsonLd site={site} locale="fr" />)

    expect(data.sameAs).toEqual(['https://github.com/BDenisss'])
  })

  it('donne une adresse postale limitée à la ville et au pays', () => {
    const { data } = renderPayload(<PersonJsonLd site={aSiteProfile()} locale="fr" />)

    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Nanterre',
      addressCountry: 'FR',
    })
  })

  it('n’expose jamais l’e-mail ni le téléphone, même affichés sur le site', () => {
    const site = aSiteProfile({
      contact: {
        email: 'contact@denis.example',
        phone: 'phone-sentinel-value',
        showPhone: true,
        linkedin: null,
        github: null,
      },
    })

    const { raw, data } = renderPayload(<PersonJsonLd site={site} locale="fr" />)

    expect(data).not.toHaveProperty('email')
    expect(data).not.toHaveProperty('telephone')
    expect(raw).not.toContain('contact@denis.example')
    expect(raw).not.toContain('phone-sentinel-value')
  })

  it('échappe « < » pour qu’un contenu éditorial ne referme pas la balise script', () => {
    const site = aSiteProfile({ name: '</script><img src=x onerror=alert(1)>' })

    const { raw, data } = renderPayload(<PersonJsonLd site={site} locale="fr" />)

    expect(raw).not.toContain('<')
    expect(data.name).toBe('</script><img src=x onerror=alert(1)>')
  })
})
