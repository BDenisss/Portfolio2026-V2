export const NAMESPACES = [
  'common',
  'nav',
  'hero',
  'about',
  'services',
  'stack',
  'projects',
  'journey',
  'process',
  'contact',
  'footer',
  'errors',
] as const

export type Namespace = (typeof NAMESPACES)[number]
