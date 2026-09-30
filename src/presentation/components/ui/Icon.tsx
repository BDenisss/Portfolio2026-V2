import {
  ArrowUp,
  ArrowUpRight,
  Blocks,
  Bot,
  Briefcase,
  Calendar,
  ChevronDown,
  Cloud,
  Code,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FolderKanban,
  Globe,
  House,
  Layers,
  Mail,
  Rocket,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceIconName } from '@/domain'

// Tables statiques : on n'importe jamais `icons` en bloc, pour ne pas embarquer toute la bibliothèque.
const SERVICE_ICONS: Record<ServiceIconName, LucideIcon> = {
  layers: Layers,
  blocks: Blocks,
  bot: Bot,
  cloud: Cloud,
  'shield-check': ShieldCheck,
  code: Code,
  database: Database,
  rocket: Rocket,
  cpu: Cpu,
  workflow: Workflow,
  globe: Globe,
  smartphone: Smartphone,
}

const UI_ICONS = {
  'arrow-up': ArrowUp,
  'arrow-up-right': ArrowUpRight,
  download: Download,
  send: Send,
  home: House,
  user: User,
  layers: Layers,
  'folder-kanban': FolderKanban,
  mail: Mail,
  'chevron-down': ChevronDown,
  'external-link': ExternalLink,
  calendar: Calendar,
  briefcase: Briefcase,
  code: Code,
  sparkles: Sparkles,
} as const satisfies Record<string, LucideIcon>

export type UiIconName = keyof typeof UI_ICONS

type IconProps = { className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }

export function ServiceIcon({ name, ...props }: IconProps & { name: ServiceIconName }) {
  const Icon = SERVICE_ICONS[name]
  return <Icon aria-hidden="true" {...props} />
}

export function UiIcon({ name, ...props }: IconProps & { name: UiIconName }) {
  const Icon = UI_ICONS[name]
  return <Icon aria-hidden="true" {...props} />
}
