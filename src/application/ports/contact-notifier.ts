import type { NewContactMessage } from './contact-message-repository'

export interface ContactNotifier {
  notify(message: NewContactMessage): Promise<void>
}
