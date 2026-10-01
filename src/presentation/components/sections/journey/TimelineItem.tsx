import type { Experience, Locale } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Chip } from '@/presentation/components/ui/Chip'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { cn } from '@/presentation/lib/cn'
import { formatRange } from '@/presentation/lib/format-date'

const VISIBLE_HIGHLIGHTS = 3
const MAX_STACK_CHIPS = 6

export type TimelineLabels = {
  present: string
  work: string
  education: string
  details: string
  stacks: string
}

type TimelineItemProps = {
  experience: Experience
  locale: Locale
  labels: TimelineLabels
  isLatest: boolean
}

function HighlightList({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[var(--ink-2)] marker:text-[var(--accent)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Les trois premières puces sont visibles ; le reste se déplie avec un <details> natif (clavier, sans JS). */
function Highlights({ items, detailsLabel }: { items: readonly string[]; detailsLabel: string }) {
  const visible = items.slice(0, VISIBLE_HIGHLIGHTS)
  const hidden = items.slice(VISIBLE_HIGHLIGHTS)
  return (
    <>
      <HighlightList items={visible} />
      {hidden.length > 0 && (
        <details className="group mt-3">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-[var(--accent-text)]">
            {detailsLabel}
          </summary>
          <div className="mt-2">
            <HighlightList items={hidden} />
          </div>
        </details>
      )}
    </>
  )
}

export function TimelineItem({ experience, locale, labels, isLatest }: TimelineItemProps) {
  const { kind, role, organization, location, start, end, summary, highlights, stacks } = experience
  const range = formatRange(start, end, locale, labels.present)
  // L'élément de liste porte lui-même la révélation : un wrapper entre <ol> et <li> casse la sémantique de liste.
  return (
    <Reveal
      as="li"
      className={cn(
        'relative pb-8 pl-10 last:pb-0 lg:pl-[12.5rem]',
        // Rail : un segment par item, prolongé jusqu'au point de l'item suivant (-bottom-7 = son top-7), sans coupure.
        'before:absolute before:top-7 before:-bottom-7 before:left-[0.6875rem] before:w-px before:bg-[var(--glass-hairline)] last:before:bottom-auto last:before:h-4 lg:before:left-[calc(10rem+1.25rem)]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-7 left-1 size-[0.875rem] rounded-full border-2 border-white',
          isLatest ? 'bg-[var(--accent-strong)]' : 'bg-[var(--accent-soft)]',
          'lg:left-[calc(10rem+0.8125rem)]',
        )}
      />
      <Glass as="article" variant="card" data-testid="timeline-item" className="space-y-4 p-6">
        {/* La période fait partie de l'entrée ; sur grand écran elle se place à gauche du rail. */}
        <p className="text-sm font-medium text-[var(--ink-muted)] lg:absolute lg:top-6 lg:right-full lg:mr-10 lg:w-40 lg:text-right">
          {range}
        </p>
        <div className="space-y-2">
          <Chip tone={kind === 'work' ? 'glass' : 'accent'}>
            {kind === 'work' ? labels.work : labels.education}
          </Chip>
          <h3 className="font-display text-xl">{role}</h3>
          <p className="text-[var(--ink-muted)]">
            {organization}
            {location && ` · ${location}`}
          </p>
        </div>
        {summary && <p className="text-[var(--ink-2)]">{summary}</p>}
        {highlights.length > 0 && <Highlights items={highlights} detailsLabel={labels.details} />}
        {stacks.length > 0 && (
          <ul aria-label={labels.stacks} className="flex flex-wrap gap-2">
            {stacks.slice(0, MAX_STACK_CHIPS).map((stack) => (
              <li key={stack.id}>
                <Chip>{stack.name}</Chip>
              </li>
            ))}
          </ul>
        )}
      </Glass>
    </Reveal>
  )
}
