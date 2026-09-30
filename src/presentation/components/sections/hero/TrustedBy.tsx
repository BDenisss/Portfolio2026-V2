import type { TrustedOrganization } from '@/domain'

type TrustedByProps = { title: string; items: readonly TrustedOrganization[] }

/** Organisations citées en texte simple : jamais de logo (aucun accord de marque). */
export function TrustedBy({ title, items }: TrustedByProps) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="text-sm text-[var(--ink-muted)]">{title}</p>
      <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {items.map((item, index) => (
          <li key={item.name} className="font-display font-semibold text-[var(--ink-muted)]">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--ink)]"
              >
                {item.name}
              </a>
            ) : (
              item.name
            )}
            {/* Séparateur après le nom : à la coupure de ligne il reste en fin de ligne, jamais orphelin en début. */}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="ml-3">
                ·
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
