const UNKNOWN_IP = '0.0.0.0'

/** Première adresse de `x-forwarded-for` (le client d'origine), puis `x-real-ip`. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || UNKNOWN_IP
}
