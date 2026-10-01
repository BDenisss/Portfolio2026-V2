import type { MetadataRoute } from 'next'

const DEFAULT_SITE_URL = 'http://localhost:3000'
const PRIVATE_PATHS = ['/admin', '/api']

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
    sitemap: new URL('/sitemap.xml', siteUrl).href,
  }
}
