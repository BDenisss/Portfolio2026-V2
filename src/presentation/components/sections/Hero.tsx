import { useTranslations } from 'next-intl'
import type { CinematicMedia, LabeledValue, SiteProfile } from '@/domain'
import { GlassOrb } from '@/presentation/components/cinematic/GlassOrb'
import { HeroMotion } from '@/presentation/components/cinematic/HeroMotion'
import { HeroStage } from '@/presentation/components/cinematic/HeroStage'
import { Glass } from '@/presentation/components/glass/Glass'
import { Button } from '@/presentation/components/ui/Button'
import { Eyebrow } from '@/presentation/components/ui/Eyebrow'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { CvMenu } from './hero/CvMenu'
import { RotatingTitle } from './hero/RotatingTitle'
import { TrustedBy } from './hero/TrustedBy'

const CHIP_POSITIONS = ['top-4 right-2 lg:-right-4', 'bottom-6 left-2 lg:-left-4'] as const

function HeroChip({ chip, position }: { chip: LabeledValue; position: string }) {
  return (
    <Glass
      variant="card"
      data-testid="hero-chip"
      data-hero-chip
      className={`absolute z-10 flex flex-col px-4 py-3 ${position}`}
    >
      <span className="font-display text-2xl leading-none font-semibold text-[var(--ink)]">
        {chip.value}
      </span>
      <span className="mt-1 text-sm text-[var(--ink-muted)]">{chip.label}</span>
    </Glass>
  )
}

type HeroProps = { site: SiteProfile; cinematic: CinematicMedia }

export function Hero({ site, cinematic }: HeroProps) {
  const t = useTranslations('hero')
  const { hero } = site
  // Sans aucun média du CMS, le cadre n'affiche qu'un orbe décoratif : il ne doit pas annoncer un avatar inexistant.
  const hasAvatarMedia = Boolean(
    cinematic.avatarModel || cinematic.avatarPortrait || cinematic.heroPoster,
  )
  return (
    <HeroMotion className="relative overflow-x-clip">
      <div className="container-x grid min-h-[100svh] items-center gap-10 pt-28 pb-12 lg:grid-cols-12 lg:pt-24">
        <div data-hero-copy className="space-y-6 lg:col-span-7">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.75rem,1rem+6vw,5.5rem)] leading-[0.95] font-semibold"
          >
            {site.name}
          </h1>
          <RotatingTitle titles={hero.rotatingTitles} label={t('titlesLabel')} />
          <Reveal as="p" className="max-w-prose text-lg text-[var(--ink-2)]">
            {site.tagline}
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-3">
            <Button size="lg" magnetic href="#projects" icon="arrow-up-right">
              {hero.ctaPrimary || t('ctaPrimary')}
            </Button>
            <CvMenu
              fullstack={site.cv.fullstack}
              ai={site.cv.ai}
              label={hero.ctaSecondary || t('cvMenuLabel')}
              fullstackLabel={t('cvFullstack')}
              aiLabel={t('cvAi')}
            />
          </Reveal>
          <Reveal>
            <TrustedBy title={hero.trustedByTitle} items={hero.trustedBy} />
          </Reveal>
        </div>
        <div className="relative mx-auto w-full max-w-[min(100%,calc(70svh*0.8))] lg:col-span-5 lg:max-w-none">
          <GlassOrb
            size="9rem"
            tint="blue"
            className="absolute -top-6 right-0 -z-10 lg:-top-8 lg:-right-8"
          />
          <HeroStage cinematic={cinematic} avatarAlt={hasAvatarMedia ? t('avatarAlt') : ''} />
          {hero.chips.slice(0, CHIP_POSITIONS.length).map((chip, index) => (
            <HeroChip key={chip.label} chip={chip} position={CHIP_POSITIONS[index] ?? ''} />
          ))}
        </div>
      </div>
    </HeroMotion>
  )
}
