import { notFound } from 'next/navigation'

// Toute URL inconnue sous /[locale] rend la 404 localisée (not-found.tsx).
export default function CatchAll(): never {
  notFound()
}
