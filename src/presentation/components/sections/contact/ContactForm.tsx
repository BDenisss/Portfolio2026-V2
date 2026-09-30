'use client'
import { useTranslations } from 'next-intl'
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useFormStatus } from 'react-dom'
import type { SubmitContactResult } from '@/application/contact/submit-contact-message'
import { CONTACT_TOPICS, type ContactFieldError, type Locale } from '@/domain'
import { Button } from '@/presentation/components/ui/Button'
import { FormField } from './FormField'

export type ContactFormState = { status: 'idle' } | SubmitContactResult
export type ContactFormAction = (
  previous: ContactFormState,
  formData: FormData,
) => Promise<ContactFormState>

type FieldName = 'name' | 'email' | 'topic' | 'message'
type FieldValues = Partial<Record<FieldName, string>>

const FIELD_NAMES: readonly FieldName[] = ['name', 'email', 'topic', 'message']

const fieldErrorsOf = (state: ContactFormState): Partial<Record<FieldName, ContactFieldError>> =>
  state.status === 'invalid' ? state.fieldErrors : {}

function readValues(formData: FormData): FieldValues {
  const values: FieldValues = {}
  for (const name of FIELD_NAMES) {
    const value = formData.get(name)
    if (typeof value === 'string') values[name] = value
  }
  return values
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" icon="send" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

/**
 * React 19 réinitialise le formulaire à la fin de l'action, même sur une erreur de validation : on garde donc
 * les valeurs soumises pour les remettre en `defaultValue`, sauf après un envoi réussi.
 */
function useContactSubmission(action: ContactFormAction) {
  const [values, setValues] = useState<FieldValues>({})
  const submit = useCallback<ContactFormAction>(
    async (previous, formData) => {
      const result = await action(previous, formData)
      startTransition(() => setValues(result.status === 'ok' ? {} : readValues(formData)))
      return result
    },
    [action],
  )
  const [state, formAction] = useActionState(submit, { status: 'idle' } as ContactFormState)
  return { values, state, formAction }
}

/** Horodate l'affichage du formulaire (time-trap) : à chaque état, car l'envoi réussi le réinitialise. */
function useStartedAt(state: ContactFormState): RefObject<HTMLInputElement | null> {
  const startedAt = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now())
  }, [state])
  return startedAt
}

function useFocusFirstError(state: ContactFormState, form: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status !== 'invalid') return
    form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [state, form])
}

export function ContactForm({ locale, action }: { locale: Locale; action: ContactFormAction }) {
  const t = useTranslations('contact')
  const te = useTranslations('errors')
  const uid = useId()
  const form = useRef<HTMLFormElement>(null)
  const { values, state, formAction } = useContactSubmission(action)
  const startedAt = useStartedAt(state)
  useFocusFirstError(state, form)

  const errors = fieldErrorsOf(state)
  const errorText = (name: FieldName): string | undefined =>
    errors[name] ? te(errors[name]) : undefined

  return (
    <form
      ref={form}
      data-testid="contact-form"
      action={formAction}
      noValidate
      className="space-y-5"
    >
      <FormField id={`${uid}-name`} label={t('fields.name')} error={errorText('name')}>
        {(control) => (
          <input
            {...control}
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={values.name}
          />
        )}
      </FormField>
      <FormField id={`${uid}-email`} label={t('fields.email')} error={errorText('email')}>
        {(control) => (
          <input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values.email}
          />
        )}
      </FormField>
      <FormField id={`${uid}-topic`} label={t('fields.topic')} error={errorText('topic')}>
        {(control) => (
          <select {...control} name="topic" defaultValue={values.topic ?? CONTACT_TOPICS[0]}>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`topics.${topic}`)}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <FormField id={`${uid}-message`} label={t('fields.message')} error={errorText('message')}>
        {(control) => (
          <textarea {...control} name="message" rows={6} defaultValue={values.message} />
        )}
      </FormField>

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" ref={startedAt} defaultValue="" />
      {/* Piège à robots : invisible et hors du parcours clavier, un humain ne le remplit jamais. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {t('honeypot')}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton label={t('submit')} pendingLabel={t('sending')} />
      <StatusMessage state={state} />
    </form>
  )
}

function StatusMessage({ state }: { state: ContactFormState }) {
  const t = useTranslations('contact')
  const messages = { ok: t('success'), error: t('error'), rate_limited: t('rateLimited') } as const
  const text = state.status in messages ? messages[state.status as keyof typeof messages] : null
  return (
    <div role="status" aria-live="polite" data-testid="contact-status">
      {text && (
        <p className={state.status === 'ok' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
          {text}
        </p>
      )}
    </div>
  )
}
