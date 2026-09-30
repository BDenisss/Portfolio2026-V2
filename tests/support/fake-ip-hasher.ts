import type { IpHasher } from '@/application/ports/ip-hasher'

export const fakeIpHasher: IpHasher = { hash: (ip) => `h(${ip})` }
