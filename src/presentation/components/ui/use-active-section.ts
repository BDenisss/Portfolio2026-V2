'use client'
import { useEffect, useState } from 'react'

// La section « active » est celle qui traverse une bande centrale du viewport.
const ACTIVE_BAND_MARGIN = '-40% 0px -50% 0px'

export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: ACTIVE_BAND_MARGIN },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}
