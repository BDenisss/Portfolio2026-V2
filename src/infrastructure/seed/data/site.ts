import type { Loc } from './types'

const both = (value: string): Loc<string> => ({ fr: value, en: value })

// Sources : profils des CV FR et IA. Le téléphone n'est jamais ici : il vient de SEED_PHONE (voir seed-site.ts).
export const site = {
  identity: {
    name: 'Denis Bucspun',
    location: 'Nanterre, France',
    jobTitle: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    tagline: {
      fr: 'Je conçois des applications web et mobiles solides, de l’idée au déploiement, avec une vraie exigence d’architecture, de tests et de qualité logicielle.',
      en: 'I design solid web and mobile applications, from idea to deployment, with a real commitment to architecture, testing and software quality.',
    },
  },
  hero: {
    eyebrow: { fr: 'Bonjour, je suis', en: 'Hello, I’m' },
    rotatingTitles: [
      { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
      { fr: 'Ingénieur Logiciel IA / GenAI', en: 'AI / GenAI Software Engineer' },
    ],
    ctaPrimary: { fr: 'Voir mes projets', en: 'View my work' },
    ctaSecondary: { fr: 'Télécharger mon CV', en: 'Download my CV' },
    chips: [
      { value: { fr: '3 ans', en: '3 years' }, label: { fr: 'd’alternance', en: 'of work-study' } },
      { value: both('.NET · React'), label: { fr: '& IA générative', en: '& generative AI' } },
    ],
    trustedByTitle: { fr: 'Ils m’ont fait confiance', en: 'They trusted me' },
    trustedBy: ['Bouygues Telecom Business Solutions', 'Axima Concept', 'Ville de Clamart'],
  },
  about: {
    headline: {
      fr: 'Concevoir avec rigueur, livrer avec pragmatisme',
      en: 'Design with rigor, deliver with pragmatism',
    },
    bio: {
      fr: 'Développeur Full Stack avec une expérience concrète en conception et développement d’applications web et mobiles. Habitué aux backends .NET et ASP.NET Core, aux frontends React, React Native et TypeScript et à l’intégration d’API externes. Je pratique la Clean Architecture, le Domain-Driven Design, les tests automatisés et les déploiements cloud sur Azure. Côté IA, je conçois des solutions d’IA générative (LLM, agents, systèmes multi-agents, MCP, RAG, tool calling) et j’utilise Claude Code et Codex pour accélérer le développement et itérer rapidement, tout en gardant une exigence de qualité et de maintenabilité. À l’aise pour analyser les compromis entre dette technique, qualité logicielle et vitesse de livraison.',
      en: 'Full Stack Developer with hands-on experience designing and building web and mobile applications. Comfortable with .NET and ASP.NET Core backends, React, React Native and TypeScript frontends, and external API integration. I practice Clean Architecture, Domain-Driven Design, automated testing and cloud deployments on Azure. On the AI side, I design generative AI solutions (LLMs, agents, multi-agent systems, MCP, RAG, tool calling) and use Claude Code and Codex to speed up development and iterate quickly, while keeping a high bar for quality and maintainability. At ease analysing the trade-offs between technical debt, software quality and delivery speed.',
    },
    autoStats: true,
  },
  process: {
    headline: { fr: 'De l’idée à la production', en: 'From idea to production' },
    steps: [
      {
        title: { fr: 'Comprendre le besoin', en: 'Understand the need' },
        text: {
          fr: 'Partir du besoin métier et échanger régulièrement avec les utilisateurs pour identifier leurs attentes.',
          en: 'Start from the business need and talk regularly with users to identify what they expect.',
        },
      },
      {
        title: { fr: 'Modéliser', en: 'Model' },
        text: {
          fr: 'Modélisation métier, conception d’API et choix d’architecture (Clean Architecture, DDD, hexagonale).',
          en: 'Business modelling, API design and architecture choices (Clean Architecture, DDD, hexagonal).',
        },
      },
      {
        title: { fr: 'Construire', en: 'Build' },
        text: {
          fr: 'Développement full stack itératif, accéléré par des workflows assistés par IA (Claude Code, Codex).',
          en: 'Iterative full-stack development, accelerated by AI-assisted workflows (Claude Code, Codex).',
        },
      },
      {
        title: { fr: 'Tester', en: 'Test' },
        text: {
          fr: 'Tests unitaires et applicatifs (xUnit, NSubstitute) et stratégie de couverture.',
          en: 'Unit and application tests (xUnit, NSubstitute) and a coverage strategy.',
        },
      },
      {
        title: { fr: 'Déployer & faire évoluer', en: 'Deploy & evolve' },
        text: {
          fr: 'Conteneurisation, CI/CD (GitHub Actions, Azure DevOps), déploiement sur Azure, puis run et évolution.',
          en: 'Containerization, CI/CD (GitHub Actions, Azure DevOps), deployment to Azure, then run and evolution.',
        },
      },
    ],
  },
  contact: {
    email: 'bucspun.d@gmail.com',
    linkedin: 'https://www.linkedin.com/in/denis-bucspun-13198a23b/',
    // Compte GitHub confirmé par Denis : « BDenisss » (le CV indique « BDeniss »).
    github: 'https://github.com/BDenisss',
    showPhone: false,
  },
  seo: {
    title: {
      fr: 'Denis Bucspun — Développeur Full Stack & Ingénieur IA',
      en: 'Denis Bucspun — Full Stack Developer & AI Engineer',
    },
    description: {
      fr: 'Portfolio : développement full stack (React, .NET), architecture logicielle, IA générative et DevOps.',
      en: 'Portfolio: full-stack development (React, .NET), software architecture, generative AI and DevOps.',
    },
  },
} as const
