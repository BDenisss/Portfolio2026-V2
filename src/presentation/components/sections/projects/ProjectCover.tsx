import Image from 'next/image'
import type { ProjectSummary } from '@/domain'
import { coverGradient } from '@/presentation/lib/project-cover'

const IMAGE_SIZES = '(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw'
const MONOGRAM_LENGTH = 2

const monogramOf = (title: string): string =>
  title
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, MONOGRAM_LENGTH)
    .toUpperCase()

/** Image du projet, ou dégradé déterministe + monogramme décoratif. Jamais de texte porteur de sens sur l'image. */
export function ProjectCover({ project }: { project: ProjectSummary }) {
  const { cover, slug, title } = project
  if (cover) {
    return (
      <Image
        src={cover.url}
        alt={cover.alt}
        fill
        sizes={IMAGE_SIZES}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    )
  }
  const { from, to, angle } = coverGradient(slug)
  return (
    <div
      aria-hidden="true"
      className="grid size-full place-items-center transition-transform duration-500 group-hover:scale-[1.04]"
      style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
    >
      <span className="font-display text-7xl font-semibold text-white/70">{monogramOf(title)}</span>
    </div>
  )
}
