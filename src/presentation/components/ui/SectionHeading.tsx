import { cn } from '@/presentation/lib/cn'
import { Eyebrow } from './Eyebrow'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  /** Convention : `<sectionId>-title`, référencé par `aria-labelledby` de la section. */
  id: string
  align?: 'start' | 'center'
}

export function SectionHeading({ eyebrow, title, id, align = 'start' }: SectionHeadingProps) {
  return (
    <header className={cn('mb-8 md:mb-12', align === 'center' && 'text-center')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-2 text-[clamp(1.75rem,1rem+3vw,3rem)] leading-tight font-semibold">
        {title}
      </h2>
    </header>
  )
}
