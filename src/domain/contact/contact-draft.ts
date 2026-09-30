import { DEFAULT_LOCALE, isLocale, type Locale } from '../locale'
import { err, ok, type Result } from '../shared/result'
import { CONTACT_TOPICS, type ContactTopic } from './contact-topic'

export type RawContactInput = Readonly<Record<string, unknown>>

export type ContactDraft = {
  readonly name: string
  readonly email: string
  readonly topic: ContactTopic
  readonly message: string
  readonly locale: Locale
}

export type ContactFieldError = 'required' | 'emailInvalid' | 'tooShort' | 'tooLong'
export type ContactFieldErrors = Partial<
  Record<'name' | 'email' | 'topic' | 'message', ContactFieldError>
>

const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 10, max: 2000 },
} as const
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Seules les chaînes comptent : un fichier ou un nombre injecté dans le FormData vaut « champ vide ». */
const text = (raw: RawContactInput, key: string): string => {
  const value = raw[key]
  return typeof value === 'string' ? value.trim() : ''
}

function checkLength(value: string, min: number, max: number): ContactFieldError | null {
  if (value === '') return 'required'
  if (value.length < min) return 'tooShort'
  return value.length > max ? 'tooLong' : null
}

function checkEmail(value: string): ContactFieldError | null {
  const length = checkLength(value, 1, LIMITS.email.max)
  if (length) return length
  return EMAIL_PATTERN.test(value) ? null : 'emailInvalid'
}

const isKnownTopic = (value: string): value is ContactTopic =>
  (CONTACT_TOPICS as readonly string[]).includes(value)

const fieldError = (
  field: keyof ContactFieldErrors,
  error: ContactFieldError | null,
): ContactFieldErrors => (error ? { [field]: error } : {})

export function validateContactDraft(
  raw: RawContactInput,
): Result<ContactDraft, ContactFieldErrors> {
  const name = text(raw, 'name')
  const email = text(raw, 'email')
  const topic = text(raw, 'topic')
  const message = text(raw, 'message')
  const errors: ContactFieldErrors = {
    ...fieldError('name', checkLength(name, LIMITS.name.min, LIMITS.name.max)),
    ...fieldError('email', checkEmail(email)),
    ...fieldError('topic', isKnownTopic(topic) ? null : 'required'),
    ...fieldError('message', checkLength(message, LIMITS.message.min, LIMITS.message.max)),
  }
  if (Object.keys(errors).length > 0 || !isKnownTopic(topic)) return err(errors)
  const locale = isLocale(raw.locale) ? raw.locale : DEFAULT_LOCALE
  return ok({ name, email, topic, message, locale })
}

/** Le champ `website` est invisible pour un humain : s'il est rempli, c'est un robot. */
export const isHoneypotFilled = (raw: RawContactInput): boolean => text(raw, 'website') !== ''

export function readStartedAt(raw: RawContactInput): number | undefined {
  const { startedAt } = raw
  if (typeof startedAt !== 'string' || startedAt.trim() === '') return undefined
  const value = Number(startedAt)
  return Number.isFinite(value) ? value : undefined
}
