import { Resend } from 'resend'
import type { NewContactMessage } from '@/application/ports/contact-message-repository'
import type { ContactNotifier } from '@/application/ports/contact-notifier'

type Dependencies = {
  apiKey: string
  from: string
  /** Destinataire de repli (variable d'environnement), utilisé quand le CMS n'en définit pas. */
  fallbackTo: string
  resolveRecipient: () => Promise<string | null>
}

const MAX_SUBJECT_LENGTH = 120
// Retire les retours à la ligne et caractères de contrôle : le nom saisi ne doit jamais pouvoir forger un en-tête.
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]+/g

const cleanLine = (value: string): string => value.replace(CONTROL_CHARACTERS, ' ').trim()

function subjectOf(message: NewContactMessage): string {
  return `[Portfolio] ${message.topic} — ${cleanLine(message.name)}`.slice(0, MAX_SUBJECT_LENGTH)
}

/** Texte brut uniquement : aucun contenu saisi par le visiteur n'est interprété comme du HTML. */
function bodyOf(message: NewContactMessage): string {
  return [
    `Nom : ${cleanLine(message.name)}`,
    `E-mail : ${message.email}`,
    `Sujet : ${message.topic}`,
    `Langue : ${message.locale}`,
    '',
    message.message,
  ].join('\n')
}

export class ResendContactNotifier implements ContactNotifier {
  private readonly client: Resend

  constructor(private readonly deps: Dependencies) {
    this.client = new Resend(deps.apiKey)
  }

  async notify(message: NewContactMessage): Promise<void> {
    const to = (await this.deps.resolveRecipient()) ?? this.deps.fallbackTo
    if (!to) return
    const { error } = await this.client.emails.send({
      from: this.deps.from,
      to,
      replyTo: message.email,
      subject: subjectOf(message),
      text: bodyOf(message),
    })
    // Resend signale ses refus par valeur de retour, pas par exception : on les rend visibles dans les logs.
    if (error) console.error('[contact] notification non envoyée :', error.message)
  }
}
