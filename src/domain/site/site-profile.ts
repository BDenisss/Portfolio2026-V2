import type { MediaAsset } from '../media'

export type LabeledValue = { readonly value: string; readonly label: string }

export type TrustedOrganization = { readonly name: string; readonly url: string | null }

export type HeroContent = {
  readonly eyebrow: string
  readonly rotatingTitles: readonly string[]
  readonly ctaPrimary: string
  readonly ctaSecondary: string
  readonly chips: readonly LabeledValue[]
  readonly trustedByTitle: string
  readonly trustedBy: readonly TrustedOrganization[]
}

export type AboutContent = {
  readonly headline: string
  readonly bio: string
  readonly autoStats: boolean
  readonly stats: readonly LabeledValue[]
}

export type ProcessStep = { readonly title: string; readonly text: string }

export type ProcessContent = { readonly headline: string; readonly steps: readonly ProcessStep[] }

export type ContactDetails = {
  readonly email: string | null
  readonly phone: string | null
  readonly showPhone: boolean
  readonly linkedin: string | null
  readonly github: string | null
}

export type SiteProfile = {
  readonly name: string
  readonly jobTitle: string
  readonly tagline: string
  readonly location: string
  readonly hero: HeroContent
  readonly about: AboutContent
  readonly process: ProcessContent
  readonly contact: ContactDetails
  readonly cv: { readonly fullstack: MediaAsset | null; readonly ai: MediaAsset | null }
  readonly seo: {
    readonly title: string
    readonly description: string
    readonly ogImage: MediaAsset | null
  }
}
