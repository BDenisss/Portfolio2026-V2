import type { ServiceIconName } from './service-icon'

export type ServiceTint = 'amber' | 'violet' | 'blue' | 'teal'

export type Service = {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly icon: ServiceIconName
  readonly tint: ServiceTint
}
