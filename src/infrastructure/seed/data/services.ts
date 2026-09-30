import type { SeedService } from './types'

export const services: readonly SeedService[] = [
  {
    key: 'full-stack',
    icon: 'layers',
    tint: 'amber',
    title: { fr: 'Développement Full Stack', en: 'Full Stack Development' },
    description: {
      fr: 'Applications web et mobiles de bout en bout : React, Next.js et React Native / Expo côté front, ASP.NET Core et API REST côté back.',
      en: 'End-to-end web and mobile applications: React, Next.js and React Native / Expo on the front end, ASP.NET Core and REST APIs on the back end.',
    },
  },
  {
    key: 'architecture',
    icon: 'blocks',
    tint: 'violet',
    title: { fr: 'Architecture & qualité', en: 'Architecture & quality' },
    description: {
      fr: 'Clean Architecture, DDD et architecture hexagonale pour isoler la logique métier ; tests xUnit / NSubstitute et stratégie de couverture.',
      en: 'Clean Architecture, DDD and hexagonal architecture to isolate business logic; xUnit / NSubstitute tests and a coverage strategy.',
    },
  },
  {
    key: 'ia',
    icon: 'bot',
    tint: 'blue',
    title: { fr: 'IA générative & agents', en: 'Generative AI & agents' },
    description: {
      fr: 'LLM, agents et systèmes multi-agents, MCP, RAG et tool calling pour connecter les modèles à des données, des outils et des services.',
      en: 'LLMs, agents and multi-agent systems, MCP, RAG and tool calling to connect models to data, tools and services.',
    },
  },
  {
    key: 'cloud',
    icon: 'cloud',
    tint: 'teal',
    title: { fr: 'Cloud, DevOps & sécurité', en: 'Cloud, DevOps & security' },
    description: {
      fr: 'Docker, Azure, CI/CD (GitHub Actions, Azure DevOps) ; authentification OAuth 2.0 / PKCE et Microsoft Entra ID (SSO).',
      en: 'Docker, Azure, CI/CD (GitHub Actions, Azure DevOps); OAuth 2.0 / PKCE authentication and Microsoft Entra ID (SSO).',
    },
  },
]
