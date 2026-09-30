import type { Stack } from '../stack/stack'

export type ExperienceKind = 'work' | 'education'

export type Experience = {
  readonly id: string
  readonly kind: ExperienceKind
  readonly role: string
  readonly organization: string
  readonly location: string | null
  readonly start: string
  readonly end: string | null
  readonly summary: string
  readonly highlights: readonly string[]
  readonly stacks: readonly Stack[]
}
