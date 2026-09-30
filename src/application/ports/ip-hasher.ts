export interface IpHasher {
  /** Empreinte irréversible d'une adresse IP : seule elle est conservée. */
  hash(ip: string): string
}
