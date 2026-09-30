import type {
  CinematicMedia,
  Experience,
  Project,
  ProjectSummary,
  Service,
  SiteProfile,
  Stack,
} from '@/domain'

export const aStack = (over: Partial<Stack> = {}): Stack => ({
  id: '1',
  name: 'React',
  slug: 'react',
  category: 'frontend',
  featured: false,
  icon: { kind: 'monogram', letters: 'RE' },
  ...over,
})

export const aProjectSummary = (over: Partial<ProjectSummary> = {}): ProjectSummary => ({
  id: '1',
  slug: 'mon-projet',
  title: 'Mon projet',
  tagline: 'Une accroche',
  cover: null,
  year: 2026,
  client: null,
  featured: false,
  stacks: [],
  stackSlugs: [],
  ...over,
})

export const aProject = (over: Partial<Project> = {}): Project => ({
  ...aProjectSummary(),
  summary: 'Un résumé',
  caseStudy: null,
  gallery: [],
  links: { live: null, repo: null, caseStudyUrl: null },
  ...over,
})

export const aService = (over: Partial<Service> = {}): Service => ({
  id: '1',
  title: 'Développement Full Stack',
  description: 'Applications web et mobile.',
  icon: 'layers',
  tint: 'violet',
  ...over,
})

export const anExperience = (over: Partial<Experience> = {}): Experience => ({
  id: '1',
  kind: 'work',
  role: 'Développeur Full Stack',
  organization: 'Bouygues Telecom Business Solutions',
  location: null,
  start: '2024-10-01',
  end: null,
  summary: 'Un résumé',
  highlights: [],
  stacks: [],
  ...over,
})

export const aSiteProfile = (over: Partial<SiteProfile> = {}): SiteProfile => ({
  name: 'Denis Bucspun',
  jobTitle: 'Développeur Full Stack',
  tagline: 'Une accroche',
  location: 'Île-de-France',
  hero: {
    eyebrow: 'Bonjour, je suis',
    rotatingTitles: ['Développeur Full Stack'],
    ctaPrimary: 'Voir mes projets',
    ctaSecondary: 'Télécharger mon CV',
    chips: [],
    trustedByTitle: 'Ils m’ont fait confiance',
    trustedBy: [],
  },
  about: { headline: 'À propos', bio: 'Une bio', autoStats: true, stats: [] },
  process: { headline: 'Ma méthode', steps: [] },
  contact: { email: null, phone: null, showPhone: false, linkedin: null, github: null },
  cv: { fullstack: null, ai: null },
  seo: { title: 'Titre', description: 'Description', ogImage: null },
  ...over,
})

export const aCinematicMedia = (over: Partial<CinematicMedia> = {}): CinematicMedia => ({
  avatarModel: null,
  avatarPortrait: null,
  heroPoster: null,
  heroVideoDesktop: { mp4: null, webm: null },
  heroVideoMobile: { mp4: null, webm: null },
  scrubVideo: null,
  ...over,
})
