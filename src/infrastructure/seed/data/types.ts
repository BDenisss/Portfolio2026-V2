import type { ServiceIconName, StackCategory } from '@/domain'

export type Loc<T> = { readonly fr: T; readonly en: T }

export type SeedStack = {
  readonly name: string
  /** Défaut : slugify(name). Explicite quand slugify dégraderait le nom (C# → csharp, ASP.NET Core → aspnet-core). */
  readonly slug?: string
  readonly category: StackCategory
  readonly simpleIconSlug?: string
  readonly featured?: boolean
}

export type SeedService = {
  readonly key: string
  readonly icon: ServiceIconName
  readonly tint: 'amber' | 'violet' | 'blue' | 'teal'
  readonly title: Loc<string>
  readonly description: Loc<string>
}

export type SeedExperience = {
  readonly key: string
  readonly kind: 'work' | 'education'
  readonly organization: string
  readonly location?: string
  readonly start: string
  readonly end: string | null
  /** Slugs de stacks (voir `stackSlug`). */
  readonly stacks: readonly string[]
  readonly role: Loc<string>
  readonly summary: Loc<string>
  readonly highlights: Loc<readonly string[]>
}

export type SeedProject = {
  readonly slug: string
  readonly year: number
  readonly client: string
  readonly featured: boolean
  readonly stacks: readonly string[]
  readonly repo?: string
  readonly title: Loc<string>
  readonly tagline: Loc<string>
  readonly summary: Loc<string>
  readonly caseStudy: Loc<readonly string[]>
}
