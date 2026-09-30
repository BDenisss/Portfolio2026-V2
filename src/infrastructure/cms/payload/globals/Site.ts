import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateGlobalHook } from '@/infrastructure/cms/payload/hooks/revalidate'

const MAX_HERO_CHIPS = 3

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site',
  admin: { group: 'Réglages' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [createRevalidateGlobalHook()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'identity',
          label: 'Identité',
          fields: [
            { name: 'name', type: 'text', required: true, defaultValue: 'Denis Bucspun' },
            { name: 'jobTitle', type: 'text', localized: true, required: true },
            { name: 'tagline', type: 'textarea', localized: true },
            { name: 'location', type: 'text' },
          ],
        },
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            { name: 'eyebrow', type: 'text', localized: true },
            {
              name: 'rotatingTitles',
              type: 'array',
              minRows: 1,
              fields: [{ name: 'text', type: 'text', localized: true, required: true }],
            },
            { name: 'ctaPrimary', type: 'text', localized: true },
            { name: 'ctaSecondary', type: 'text', localized: true },
            {
              name: 'chips',
              type: 'array',
              maxRows: MAX_HERO_CHIPS,
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', localized: true, required: true },
              ],
            },
            { name: 'trustedByTitle', type: 'text', localized: true },
            {
              name: 'trustedBy',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'url', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'about',
          label: 'À propos',
          fields: [
            { name: 'headline', type: 'text', localized: true },
            { name: 'bio', type: 'textarea', localized: true },
            {
              name: 'autoStats',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Calcule automatiquement années d’expérience, technologies et projets. Décoche pour saisir tes propres chiffres.',
              },
            },
            {
              name: 'stats',
              type: 'array',
              admin: { condition: (_, siblingData) => !siblingData?.autoStats },
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', localized: true, required: true },
              ],
            },
          ],
        },
        {
          name: 'process',
          label: 'Méthode',
          fields: [
            { name: 'headline', type: 'text', localized: true },
            {
              name: 'steps',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', localized: true, required: true },
                { name: 'text', type: 'textarea', localized: true, required: true },
              ],
            },
          ],
        },
        {
          name: 'contact',
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            {
              name: 'showPhone',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Affiche le téléphone publiquement. Désactivé par défaut (spam).',
              },
            },
            { name: 'linkedin', type: 'text' },
            { name: 'github', type: 'text' },
            {
              name: 'contactTo',
              type: 'email',
              admin: {
                description:
                  'Destinataire des notifications du formulaire (jamais affiché publiquement).',
              },
            },
          ],
        },
        {
          name: 'cv',
          label: 'CV',
          fields: [
            {
              name: 'cvFullstack',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'application/pdf' } },
            },
            {
              name: 'cvAi',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'application/pdf' } },
            },
          ],
        },
        {
          name: 'seo',
          label: 'SEO',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'description', type: 'textarea', localized: true },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
            },
          ],
        },
      ],
    },
  ],
}
