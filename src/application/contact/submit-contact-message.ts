import {
  isHoneypotFilled,
  isRateLimited,
  isSubmittedTooFast,
  RATE_WINDOW_MS,
  readStartedAt,
  validateContactDraft,
  type ContactFieldErrors,
  type RawContactInput,
} from '@/domain'
import type { Clock } from '../ports/clock'
import type {
  ContactMessageRepository,
  NewContactMessage,
} from '../ports/contact-message-repository'
import type { ContactNotifier } from '../ports/contact-notifier'
import type { IpHasher } from '../ports/ip-hasher'

export type SubmitContactResult =
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: ContactFieldErrors }
  | { status: 'rate_limited' }
  | { status: 'error' }

type Dependencies = {
  messages: ContactMessageRepository
  hasher: IpHasher
  clock: Clock
  notifier?: ContactNotifier
}

export class SubmitContactMessage {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: { raw: RawContactInput; ip: string }): Promise<SubmitContactResult> {
    const draft = validateContactDraft(input.raw)
    if (!draft.ok) return { status: 'invalid', fieldErrors: draft.error }
    // Succès silencieux : un robot ne doit recevoir aucun indice sur ce qui l'a arrêté.
    if (this.looksLikeABot(input.raw)) return { status: 'ok' }

    const ipHash = this.deps.hasher.hash(input.ip)
    if (await this.isOverRateLimit(ipHash)) return { status: 'rate_limited' }

    return this.store({ ...draft.value, ipHash })
  }

  private looksLikeABot(raw: RawContactInput): boolean {
    return isHoneypotFilled(raw) || isSubmittedTooFast(readStartedAt(raw), this.deps.clock.now())
  }

  private async isOverRateLimit(ipHash: string): Promise<boolean> {
    const since = this.deps.clock.now() - RATE_WINDOW_MS
    return isRateLimited(await this.deps.messages.countSince(ipHash, since))
  }

  private async store(message: NewContactMessage): Promise<SubmitContactResult> {
    try {
      await this.deps.messages.save(message)
    } catch {
      return { status: 'error' }
    }
    await this.notifyBestEffort(message)
    return { status: 'ok' }
  }

  private async notifyBestEffort(message: NewContactMessage): Promise<void> {
    try {
      await this.deps.notifier?.notify(message)
    } catch {
      // Best-effort : le message est déjà en base, la notification ne doit pas faire échouer l'envoi.
    }
  }
}
