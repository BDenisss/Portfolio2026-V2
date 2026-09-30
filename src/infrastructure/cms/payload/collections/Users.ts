import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/infrastructure/cms/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  // Inscription publique fermée : le premier compte se crée via l'écran « premier utilisateur » de l'admin.
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [],
}
