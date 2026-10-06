const UNKNOWN_IP = '0.0.0.0'

/**
 * Dernière adresse de `x-forwarded-for`, puis `x-real-ip`.
 * Chaque proxy AJOUTE l'adresse qu'il voit à la fin de la liste : le client peut écrire ce qu'il veut à gauche,
 * mais la dernière entrée est celle posée par notre proxy de confiance (la plateforme). La première, elle, est
 * falsifiable et permettait de contourner la limite de messages par adresse.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || UNKNOWN_IP
}
