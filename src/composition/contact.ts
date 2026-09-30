import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { SubmitContactMessage } from '@/application/contact/submit-contact-message'
import type { ContactNotifier } from '@/application/ports/contact-notifier'
import { PayloadContactMessageRepository } from '@/infrastructure/cms/payload/payload-contact-message-repository'
import { ResendContactNotifier } from '@/infrastructure/contact/resend-contact-notifier'
import { Sha256IpHasher } from '@/infrastructure/contact/sha256-ip-hasher'
import { SystemClock } from '@/infrastructure/system/system-clock'

export type ContactUseCases = { readonly submitContactMessage: SubmitContactMessage }

const DEFAULT_SENDER = 'Portfolio <onboarding@resend.dev>'

let instance: ContactUseCases | undefined

export function getContactUseCases(): ContactUseCases {
  instance ??= buildContactUseCases()
  return instance
}

/** Le destinataire saisi dans le CMS (global `site`) prime ; il n'est jamais exposé au public. */
async function recipientFromCms(): Promise<string | null> {
  const payload = await getPayload({ config })
  const site = await payload.findGlobal({ slug: 'site', depth: 0, overrideAccess: true })
  return site.contact?.contactTo ?? null
}

/** Sans clé Resend, le message est enregistré mais aucune notification n'est tentée. */
function buildNotifier(): ContactNotifier | undefined {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return undefined
  return new ResendContactNotifier({
    apiKey,
    from: process.env.CONTACT_FROM || DEFAULT_SENDER,
    fallbackTo: process.env.CONTACT_TO ?? '',
    resolveRecipient: recipientFromCms,
  })
}

function buildContactUseCases(): ContactUseCases {
  return {
    submitContactMessage: new SubmitContactMessage({
      messages: new PayloadContactMessageRepository(() => getPayload({ config })),
      hasher: new Sha256IpHasher(process.env.IP_HASH_SALT ?? ''),
      clock: new SystemClock(),
      notifier: buildNotifier(),
    }),
  }
}
