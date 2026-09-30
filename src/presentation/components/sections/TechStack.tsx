import { useTranslations } from 'next-intl'
import { groupStacksByCategory, type Stack } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { StackTile } from './stack/StackTile'

export function TechStack({ stacks }: { stacks: readonly Stack[] }) {
  const t = useTranslations('stack')
  return (
    <Section id="stack" labelledBy="stack-title">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} id="stack-title" />
      <Glass variant="surface" className="space-y-8 p-4 md:p-8">
        {groupStacksByCategory(stacks).map((group) => (
          <Reveal key={group.category} as="section" aria-labelledby={`stack-${group.category}`}>
            <h3 id={`stack-${group.category}`} className="font-display mb-4 text-xl">
              {t(`categories.${group.category}`)}
            </h3>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {group.stacks.map((stack) => (
                <li key={stack.id}>
                  <StackTile stack={stack} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </Glass>
    </Section>
  )
}
