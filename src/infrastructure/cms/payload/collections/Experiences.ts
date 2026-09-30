import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { DEFAULT_ORDER } from '@/infrastructure/cms/payload/collections/constants'
import {
  createRevalidateDeleteHook,
  createRevalidateHook,
} from '@/infrastructure/cms/payload/hooks/revalidate'

const monthPicker = { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } as const

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'organization',
    defaultColumns: ['organization', 'role', 'kind', 'start', 'end'],
    group: 'Contenu',
  },
  hooks: {
    afterChange: [createRevalidateHook('home')],
    afterDelete: [createRevalidateDeleteHook('home')],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'work',
      options: [
        { label: 'Expérience', value: 'work' },
        { label: 'Formation', value: 'education' },
      ],
    },
    { name: 'role', type: 'text', localized: true, required: true },
    { name: 'organization', type: 'text', required: true },
    { name: 'location', type: 'text' },
    { name: 'start', type: 'date', required: true, admin: { date: monthPicker } },
    {
      name: 'end',
      type: 'date',
      admin: { description: 'Vide = en cours.', date: monthPicker },
    },
    { name: 'summary', type: 'textarea', localized: true },
    {
      name: 'highlights',
      type: 'array',
      fields: [{ name: 'text', type: 'text', localized: true, required: true }],
    },
    { name: 'stacks', type: 'relationship', relationTo: 'stacks', hasMany: true },
    {
      name: 'order',
      type: 'number',
      defaultValue: DEFAULT_ORDER,
      admin: { description: 'Plus petit = plus haut dans la timeline.' },
    },
  ],
}
