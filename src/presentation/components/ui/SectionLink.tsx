'use client'
import type { ComponentPropsWithoutRef } from 'react'
import { Link, usePathname } from '@/presentation/i18n/navigation'

/** Ancre `#id` sur la home ; `/#id` (localisé) depuis une autre page. */
export function useSectionHref(): (id: string) => string {
  const isHome = usePathname() === '/'
  return (id) => `${isHome ? '' : '/'}#${id}`
}

export function SectionLink({
  href,
  ...rest
}: { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  if (href.startsWith('/')) return <Link href={href} {...rest} />
  return <a href={href} {...rest} />
}
