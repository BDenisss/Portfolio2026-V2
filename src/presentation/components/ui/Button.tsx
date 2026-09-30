import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { glassAttributes } from '@/presentation/components/glass/Glass'
import { Link } from '@/presentation/i18n/navigation'
import { cn } from '@/presentation/lib/cn'
import { UiIcon, type UiIconName } from './Icon'
import { Magnetic } from './Magnetic'

type ButtonIcon = Extract<UiIconName, 'arrow-up' | 'arrow-up-right' | 'download' | 'send'>

type CommonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  icon?: ButtonIcon
  magnetic?: boolean
  className?: string
  children: ReactNode
}

type LinkProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<'a'>,
    keyof CommonProps | 'href'
  >
type ActionProps = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<'button'>,
    keyof CommonProps
  >

export type ButtonProps = LinkProps | ActionProps

const BASE =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-px'
const SIZES = { md: '', lg: 'min-h-12 px-7 text-base' } as const
const PRIMARY = 'bg-[var(--ink)] text-white hover:shadow-[0_10px_30px_rgb(11_11_20/0.25)]'

const isLinkProps = (props: ButtonProps): props is LinkProps => props.href !== undefined

/** Les chemins internes passent par le `Link` localisé ; ancres (`#x`) et URLs externes restent des <a>. */
const isInternalPath = (href: string): boolean => href.startsWith('/')

type Surface = { classes: string; glass: ReturnType<typeof glassAttributes> | null }

function Content({ icon, children }: Pick<CommonProps, 'icon' | 'children'>) {
  return (
    <>
      {children}
      {icon && <UiIcon name={icon} className="size-4" />}
    </>
  )
}

function renderLink(props: LinkProps, { classes, glass }: Surface) {
  const { href, variant, size, icon, magnetic, className, children, ...anchor } = props
  const attributes = { ...anchor, ...glass, className: glass?.className ?? classes }
  const content = <Content icon={icon}>{children}</Content>
  if (isInternalPath(href)) {
    return (
      <Link href={href} {...attributes}>
        {content}
      </Link>
    )
  }
  return (
    <a href={href} {...attributes}>
      {content}
    </a>
  )
}

function renderAction(props: ActionProps, { classes, glass }: Surface) {
  const { variant, size, icon, magnetic, className, children, type = 'button', ...button } = props
  return (
    <button type={type} {...button} {...glass} className={glass?.className ?? classes}>
      <Content icon={icon}>{children}</Content>
    </button>
  )
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', magnetic = false, className } = props
  const classes = cn(BASE, SIZES[size], variant === 'primary' && PRIMARY, className)
  const glass =
    variant === 'secondary' ? glassAttributes('pill', { interactive: true }, classes) : null
  const element = isLinkProps(props)
    ? renderLink(props, { classes, glass })
    : renderAction(props, { classes, glass })
  return magnetic ? <Magnetic>{element}</Magnetic> : element
}
