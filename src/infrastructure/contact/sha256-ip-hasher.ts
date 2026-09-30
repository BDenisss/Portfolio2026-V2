import { createHash } from 'node:crypto'
import type { IpHasher } from '@/application/ports/ip-hasher'

const HASH_LENGTH = 32

export class Sha256IpHasher implements IpHasher {
  constructor(private readonly salt: string) {}

  hash(ip: string): string {
    return createHash('sha256').update(`${this.salt}:${ip}`).digest('hex').slice(0, HASH_LENGTH)
  }
}
