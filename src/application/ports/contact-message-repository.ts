import type { ContactDraft } from '@/domain'

export type NewContactMessage = ContactDraft & { readonly ipHash: string }

export interface ContactMessageRepository {
  save(message: NewContactMessage): Promise<void>
  /** Nombre de messages de cette empreinte d'IP reçus depuis `sinceEpochMs` (limite de débit). */
  countSince(ipHash: string, sinceEpochMs: number): Promise<number>
}
