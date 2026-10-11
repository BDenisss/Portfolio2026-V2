import type { SeedService } from './types'

export const services: readonly SeedService[] = [
  {
    key: 'full-stack',
    icon: 'layers',
    tint: 'amber',
    title: { fr: 'Développement Full Stack', en: 'Full Stack Development' },
    description: {
      fr: 'Des applications web et mobiles de A à Z : React, Next.js et React Native / Expo côté front, ASP.NET Core et API REST côté back.',
      en: 'Web and mobile applications from A to Z: React, Next.js and React Native / Expo on the front end, ASP.NET Core and REST APIs on the back end.',
    },
  },
  {
    key: 'architecture',
    icon: 'blocks',
    tint: 'violet',
    title: { fr: 'Architecture & qualité', en: 'Architecture & quality' },
    description: {
      fr: 'Clean Architecture, DDD et architecture hexagonale pour garder la logique métier bien à l’abri, avec des tests xUnit / NSubstitute et un suivi de la couverture.',
      en: 'Clean Architecture, DDD and hexagonal architecture to keep business logic safe and sound, with xUnit / NSubstitute tests and coverage tracking.',
    },
  },
  {
    key: 'ia',
    icon: 'bot',
    tint: 'blue',
    title: { fr: 'IA générative & agents', en: 'Generative AI & agents' },
    description: {
      fr: 'LLM, agents et systèmes multi-agents, MCP, RAG et tool calling, pour brancher les modèles sur vos données, vos outils et vos services.',
      en: 'LLMs, agents and multi-agent systems, MCP, RAG and tool calling, to plug models into your data, tools and services.',
    },
  },
  {
    key: 'cloud',
    icon: 'cloud',
    tint: 'teal',
    title: { fr: 'Cloud, DevOps & sécurité', en: 'Cloud, DevOps & security' },
    description: {
      fr: 'Docker, Azure et CI/CD (GitHub Actions, Azure DevOps), avec une authentification OAuth 2.0 / PKCE et Microsoft Entra ID (SSO).',
      en: 'Docker, Azure and CI/CD (GitHub Actions, Azure DevOps), with OAuth 2.0 / PKCE authentication and Microsoft Entra ID (SSO).',
    },
  },
]
