import { describe, expect, it } from 'vitest'
import { clientIp } from '@/app/(site)/[locale]/(shell)/_actions/client-ip'

describe('clientIp', () => {
  it('prend la dernière adresse de x-forwarded-for, celle ajoutée par le proxy de la plateforme', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('10.0.0.1')
  })
  it('ne se laisse pas tromper par une adresse falsifiée par le client en tête de liste', () => {
    const forged = new Headers({ 'x-forwarded-for': '203.0.113.77, 198.51.100.4' })
    expect(clientIp(forged)).toBe('198.51.100.4')
  })
  it('se replie sur x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8')
  })
  it('renvoie 0.0.0.0 par défaut', () => {
    expect(clientIp(new Headers())).toBe('0.0.0.0')
  })
  it('ignore les espaces autour de l’adresse', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '  9.9.9.9  ' }))).toBe('9.9.9.9')
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.1.1.1 ,  9.9.9.9  ' }))).toBe('9.9.9.9')
  })
})
