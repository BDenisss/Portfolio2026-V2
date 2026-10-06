import type { Access, FieldAccess } from 'payload'

export const anyone: Access = () => true
export const isAdmin: Access = ({ req }) => Boolean(req.user)

/** Champ réservé aux administrateurs : le serveur le lit via l'API locale avec `overrideAccess: true`. */
export const adminOnlyField: FieldAccess = ({ req }) => Boolean(req.user)

/**
 * Champ public seulement quand la case `flag` du même groupe est cochée, sinon réservé aux administrateurs.
 * L'accès au niveau du global ne suffit pas : REST et GraphQL renvoient tous les champs lisibles.
 */
export const publicWhenChecked =
  (flag: string): FieldAccess =>
  ({ req, siblingData }) =>
    Boolean(req.user) || siblingData?.[flag] === true
export const publishedOrAdmin: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
