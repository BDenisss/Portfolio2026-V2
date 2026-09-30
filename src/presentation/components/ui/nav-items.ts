export type SectionId =
  'hero' | 'about' | 'services' | 'stack' | 'projects' | 'journey' | 'process' | 'contact'

export type DockIcon = 'home' | 'user' | 'layers' | 'folder-kanban' | 'mail'

export const NAV_ITEMS = [
  { id: 'about' },
  { id: 'services' },
  { id: 'stack' },
  { id: 'projects' },
  { id: 'journey' },
  { id: 'contact' },
] as const satisfies readonly { id: SectionId }[]

export const DOCK_ITEMS = [
  { id: 'hero', icon: 'home' },
  { id: 'about', icon: 'user' },
  { id: 'services', icon: 'layers' },
  { id: 'projects', icon: 'folder-kanban' },
  { id: 'contact', icon: 'mail' },
] as const satisfies readonly { id: SectionId; icon: DockIcon }[]
