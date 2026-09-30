import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/infrastructure/cms/payload/access'
import { CONTACT_TOPICS, LOCALES } from '@/domain'

const MESSAGE_STATUSES = ['new', 'read', 'archived'] as const

const toOption = (value: string) => ({ label: value, value })

export const Messages: CollectionConfig = {
  slug: 'messages',
  // Création uniquement via la server action `submitContact` (API locale, overrideAccess) — jamais via REST/GraphQL.
  access: { create: () => false, read: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'topic', 'status', 'createdAt'],
    group: 'Boîte de réception',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'topic', type: 'select', required: true, options: CONTACT_TOPICS.map(toOption) },
    { name: 'message', type: 'textarea', required: true },
    { name: 'ipHash', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'locale', type: 'select', options: LOCALES.map(toOption) },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: MESSAGE_STATUSES.map(toOption),
      admin: { position: 'sidebar' },
    },
  ],
}
