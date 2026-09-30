export const STACK_CATEGORIES = [
  'language',
  'frontend',
  'backend',
  'architecture',
  'testing',
  'devops',
  'security',
  'ai',
] as const

export type StackCategory = (typeof STACK_CATEGORIES)[number]

export type StackIcon =
  | {
      readonly kind: 'simple'
      readonly slug: string
      readonly title: string
      readonly hex: string
      readonly path: string
    }
  | { readonly kind: 'upload'; readonly url: string; readonly alt: string }
  | { readonly kind: 'monogram'; readonly letters: string }

export type Stack = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly category: StackCategory
  readonly featured: boolean
  readonly icon: StackIcon
}
