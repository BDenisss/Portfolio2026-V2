// Valeurs qu'un sel ne doit jamais avoir en production : vide, ou celles des fichiers d'exemple (publiques).
const WEAK_SALTS = new Set(['', 'change-me', 'replace-with-random-salt'])

/**
 * Sel du hachage d'IP du formulaire de contact. Un sel vide ou public rend les adresses retrouvables par force
 * brute de l'espace IPv4 si la base fuit : en production, on refuse de démarrer l'envoi plutôt que de hacher mal.
 */
export function resolveIpHashSalt(
  salt: string | undefined,
  environment: string | undefined = process.env.NODE_ENV,
): string {
  const value = salt ?? ''
  if (environment === 'production' && WEAK_SALTS.has(value)) {
    throw new Error('IP_HASH_SALT doit être défini avec une valeur aléatoire en production.')
  }
  return value
}
