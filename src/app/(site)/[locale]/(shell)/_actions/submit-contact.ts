'use server'
import { headers } from 'next/headers'
import { getContactUseCases } from '@/composition'
import type { ContactFormState } from '@/presentation/components/sections/contact/ContactForm'
import { clientIp } from './client-ip'

export async function submitContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { submitContactMessage } = getContactUseCases()
  return submitContactMessage.execute({
    raw: Object.fromEntries(formData),
    ip: clientIp(await headers()),
  })
}
