'use server'

type ContactFormState = { status: 'idle' } | { status: 'error' }

// Stub : l'action réelle (validation, anti-spam, persistance) arrive avec la tâche Contact.
export async function submitContact(
  _previous: ContactFormState,
  _formData: FormData,
): Promise<ContactFormState> {
  return { status: 'error' }
}
