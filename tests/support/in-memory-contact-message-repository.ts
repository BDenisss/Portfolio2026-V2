import type {
  ContactMessageRepository,
  NewContactMessage,
} from '@/application/ports/contact-message-repository'

type Options = { recentCount?: number; failOnSave?: boolean }

export class InMemoryContactMessageRepository implements ContactMessageRepository {
  readonly saved: NewContactMessage[] = []

  constructor(private readonly options: Options = {}) {}

  async save(message: NewContactMessage): Promise<void> {
    if (this.options.failOnSave) throw new Error('base indisponible')
    this.saved.push(message)
  }

  async countSince(): Promise<number> {
    return this.options.recentCount ?? 0
  }
}
