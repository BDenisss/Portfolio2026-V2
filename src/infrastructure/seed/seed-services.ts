import type { Payload } from 'payload'
import { services } from './data/services'
import { upsertLocalized } from './upsert'

/** `services` n'a pas de slug : le titre français sert de clé naturelle. */
export async function seedServices(payload: Payload): Promise<void> {
  for (const [index, service] of services.entries()) {
    await upsertLocalized(
      payload,
      { collection: 'services', where: { title: { equals: service.title.fr } } },
      (locale) => ({
        title: service.title[locale],
        description: service.description[locale],
        icon: service.icon,
        tint: service.tint,
        order: index + 1,
      }),
    )
  }
}
