import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPortfolioUseCases } from '@/composition'
import { groupStacksByCategory, isLocale } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { ProjectBody } from '@/presentation/components/project/ProjectBody'
import { ProjectGallery } from '@/presentation/components/project/ProjectGallery'
import { ProjectHeader } from '@/presentation/components/project/ProjectHeader'
import { ProjectNavigation } from '@/presentation/components/project/ProjectNavigation'
import { Chip } from '@/presentation/components/ui/Chip'
import { Section } from '@/presentation/components/ui/Section'
import { routing } from '@/presentation/i18n/routing'
import { coverGradient } from '@/presentation/lib/project-cover'

type ProjectRouteProps = { params: Promise<{ locale: string; slug: string }> }

/** Filet de sécurité : la publication dans le CMS revalide déjà la page (hooks Payload). */
export const revalidate = 3600

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const refs = await getPortfolioUseCases().listProjectRefs.execute()
  return routing.locales.flatMap((locale) => refs.map(({ slug }) => ({ locale, slug })))
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const page = await getPortfolioUseCases().getProjectPage.execute({ locale, slug })
  if (!page) return {}
  const { project } = page
  return {
    title: project.title,
    description: project.tagline || project.summary,
    openGraph: { images: project.cover ? [project.cover.url] : undefined },
  }
}

function ProjectCoverFrame({
  slug,
  cover,
}: {
  slug: string
  cover: { url: string; alt: string } | null
}) {
  const { from, to, angle } = coverGradient(slug)
  return (
    <Glass variant="surface" className="overflow-hidden p-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius-frame)-0.5rem)]">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            priority
            sizes="(min-width: 1200px) 1100px, 92vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="size-full"
            style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
          />
        )}
      </div>
    </Glass>
  )
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const [page, t, tStack] = await Promise.all([
    getPortfolioUseCases().getProjectPage.execute({ locale, slug }),
    getTranslations('projects'),
    getTranslations('stack'),
  ])
  if (!page) notFound()
  const { project, previous, next } = page
  return (
    <Section id="project" labelledBy="project-title" className="pt-32 lg:pt-36">
      <div className="space-y-12">
        <ProjectHeader project={project} />
        <ProjectCoverFrame slug={project.slug} cover={project.cover} />
        {project.summary && (
          <p className="max-w-prose text-lg text-[var(--ink-2)]">{project.summary}</p>
        )}
        {project.stacks.length > 0 && (
          <section aria-labelledby="project-stacks" className="space-y-4">
            <h2 id="project-stacks" className="font-display text-2xl">
              {t('stacks')}
            </h2>
            {groupStacksByCategory(project.stacks).map((group) => (
              <div key={group.category} className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-[var(--ink-muted)]">
                  {tStack(`categories.${group.category}`)}
                </span>
                {group.stacks.map((stack) => (
                  <Chip key={stack.id}>{stack.name}</Chip>
                ))}
              </div>
            ))}
          </section>
        )}
        {project.caseStudy && (
          <section aria-labelledby="project-case-study" className="space-y-4">
            <h2 id="project-case-study" className="font-display text-2xl">
              {t('caseStudy')}
            </h2>
            <ProjectBody caseStudy={project.caseStudy} />
          </section>
        )}
        {project.gallery.length > 0 && (
          <section aria-labelledby="project-gallery" className="space-y-4">
            <h2 id="project-gallery" className="font-display text-2xl">
              {t('gallery')}
            </h2>
            <ProjectGallery images={project.gallery} />
          </section>
        )}
        <ProjectNavigation previous={previous} next={next} />
      </div>
    </Section>
  )
}
