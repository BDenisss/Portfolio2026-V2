import type { Service } from '@/domain'
import type { Service as ServiceDoc } from '../payload-types'

export function mapService(doc: ServiceDoc): Service {
  return {
    id: String(doc.id),
    title: doc.title,
    description: doc.description,
    icon: doc.icon,
    tint: doc.tint,
  }
}
