import type { Payload } from 'payload'
import type {
  ContactMessageRepository,
  NewContactMessage,
} from '@/application/ports/contact-message-repository'

export class PayloadContactMessageRepository implements ContactMessageRepository {
  constructor(private readonly client: () => Promise<Payload>) {}

  async save(message: NewContactMessage): Promise<void> {
    const payload = await this.client()
    // La collection `messages` refuse toute création publique : seule cette écriture serveur passe (overrideAccess).
    await payload.create({
      collection: 'messages',
      data: message,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }

  async countSince(ipHash: string, sinceEpochMs: number): Promise<number> {
    const payload = await this.client()
    const { totalDocs } = await payload.count({
      collection: 'messages',
      where: {
        and: [
          { ipHash: { equals: ipHash } },
          { createdAt: { greater_than: new Date(sinceEpochMs).toISOString() } },
        ],
      },
      overrideAccess: true,
    })
    return totalDocs
  }
}
