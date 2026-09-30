import type { Access } from 'payload'

export const anyone: Access = () => true
export const isAdmin: Access = ({ req }) => Boolean(req.user)
export const publishedOrAdmin: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
