import type { MediaAsset } from '../media'
import type { Stack } from '../stack/stack'

/** Opaque pour le domaine : seule la présentation sait rendre l'étude de cas. */
export type RichTextDocument = { readonly root: Readonly<Record<string, unknown>> }

export type ProjectLinks = {
  readonly live: string | null
  readonly repo: string | null
  readonly caseStudyUrl: string | null
}

export type ProjectSummary = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly tagline: string
  readonly cover: MediaAsset | null
  readonly year: number | null
  readonly client: string | null
  readonly featured: boolean
  readonly stacks: readonly Stack[]
  readonly stackSlugs: readonly string[]
}

export type Project = ProjectSummary & {
  readonly summary: string
  readonly caseStudy: RichTextDocument | null
  readonly gallery: readonly MediaAsset[]
  readonly links: ProjectLinks
}

export type ProjectRef = { readonly slug: string; readonly updatedAt: string }
