import type { Service } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { ServiceIcon, UiIcon } from '@/presentation/components/ui/Icon'
import { cn } from '@/presentation/lib/cn'

const TINT: Record<Service['tint'], string> = {
  amber: 'bg-[color-mix(in_srgb,var(--tint-amber)_40%,white)]',
  violet: 'bg-[color-mix(in_srgb,var(--tint-violet)_40%,white)]',
  blue: 'bg-[color-mix(in_srgb,var(--tint-blue)_40%,white)]',
  teal: 'bg-[color-mix(in_srgb,var(--tint-teal)_40%,white)]',
}

export function ServiceCard({ service, cta }: { service: Service; cta: string }) {
  return (
    <Glass
      as="a"
      href="#contact"
      interactive
      data-testid="service-card"
      aria-label={`${service.title} — ${cta}`}
      className="group flex h-full min-h-56 flex-col gap-4 p-6"
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-12 place-items-center rounded-2xl text-[var(--ink)]',
          TINT[service.tint],
        )}
      >
        <ServiceIcon name={service.icon} className="size-6" />
      </span>
      <h3 className="font-display text-xl">{service.title}</h3>
      <p className="text-[var(--ink-2)]">{service.description}</p>
      <UiIcon
        name="arrow-up-right"
        className="mt-auto size-5 self-end text-[var(--ink-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Glass>
  )
}
