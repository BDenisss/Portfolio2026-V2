import type { Loc } from './types'

const both = (value: string): Loc<string> => ({ fr: value, en: value })

// Sources : profils des CV FR et IA. Le téléphone n'est jamais ici : il vient de SEED_PHONE (voir seed-site.ts).
export const site = {
  identity: {
    name: 'Denis Bucspun',
    location: 'Nanterre, France',
    jobTitle: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    tagline: {
      fr: 'Je conçois des applications web et mobiles solides, de l’idée à la mise en ligne. J’aime le travail soigné : une architecture claire, des tests, un code qu’on a plaisir à reprendre.',
      en: 'I build solid web and mobile applications, from the first idea to going live. I like careful work: a clear architecture, tests, and code that is a pleasure to pick back up.',
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
    // `value` n'est pas localisé dans le CMS : il doit être identique en FR et en EN (le texte traduit va dans `label`).
    chips: [
      { value: both('3'), label: { fr: 'ans d’alternance', en: 'years of work-study' } },
      { value: both('.NET · React'), label: { fr: '& IA générative', en: '& generative AI' } },
    ],
    trustedByTitle: { fr: 'Ils m’ont fait confiance', en: 'They trusted me' },
    trustedBy: ['Bouygues Telecom Business Solutions', 'Axima Concept', 'Ville de Clamart'],
  },
  about: {
    headline: {
      fr: 'Faire les choses bien, sans compliquer',
      en: 'Doing things well, without overcomplicating',
    },
    bio: {
      fr: 'Je suis développeur full stack et j’ai déjà conçu et construit des applications web et mobiles de bout en bout. Mon terrain de jeu : les backends .NET et ASP.NET Core, les frontends React, React Native et TypeScript, et l’intégration d’API externes. Je travaille avec la Clean Architecture, le Domain-Driven Design, les tests automatisés et le cloud Azure. Côté IA, je conçois des solutions d’IA générative (LLM, agents, systèmes multi-agents, MCP, RAG, tool calling) et je m’appuie sur Claude Code et Codex pour avancer vite, sans lâcher la qualité ni la maintenabilité. J’aime aussi peser les compromis entre dette technique, qualité et vitesse de livraison.',
      en: 'I’m a full-stack developer and I’ve designed and built web and mobile applications from end to end. My playground: .NET and ASP.NET Core backends, React, React Native and TypeScript frontends, and external API integration. I work with Clean Architecture, Domain-Driven Design, automated testing and the Azure cloud. On the AI side, I design generative AI solutions (LLMs, agents, multi-agent systems, MCP, RAG, tool calling) and rely on Claude Code and Codex to move fast without giving up quality or maintainability. I also enjoy weighing the trade-offs between technical debt, quality and delivery speed.',
    },
    autoStats: true,
  },
  process: {
    headline: { fr: 'De l’idée à la production', en: 'From idea to production' },
    steps: [
      {
        title: { fr: 'Comprendre le besoin', en: 'Understand the need' },
        text: {
          fr: 'Je pars du besoin métier et je discute souvent avec les utilisateurs pour bien comprendre ce qu’ils attendent.',
          en: 'I start from the business need and talk often with users to really understand what they expect.',
        },
      },
      {
        title: { fr: 'Modéliser', en: 'Model' },
        text: {
          fr: 'Je modélise le métier, je dessine les API et je choisis l’architecture (Clean Architecture, DDD, hexagonale).',
          en: 'I model the business, design the APIs and pick the architecture (Clean Architecture, DDD, hexagonal).',
        },
      },
      {
        title: { fr: 'Construire', en: 'Build' },
        text: {
          fr: 'Je développe par petites itérations, en m’aidant de l’IA (Claude Code, Codex) pour aller plus vite.',
          en: 'I build in small iterations, using AI (Claude Code, Codex) to move faster.',
        },
      },
      {
        title: { fr: 'Tester', en: 'Test' },
        text: {
          fr: 'J’écris des tests unitaires et applicatifs (xUnit, NSubstitute) et je garde un œil sur la couverture.',
          en: 'I write unit and application tests (xUnit, NSubstitute) and keep an eye on coverage.',
        },
      },
      {
        title: { fr: 'Déployer & faire évoluer', en: 'Deploy & evolve' },
        text: {
          fr: 'Je conteneurise, je mets en place la CI/CD (GitHub Actions, Azure DevOps), je déploie sur Azure, puis je fais vivre le produit.',
          en: 'I containerize, set up CI/CD (GitHub Actions, Azure DevOps), deploy to Azure, then keep the product alive and evolving.',
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
      fr: 'Denis Bucspun, développeur Full Stack et ingénieur IA',
      en: 'Denis Bucspun, Full Stack Developer and AI Engineer',
    },
    description: {
      fr: 'Mon portfolio : développement full stack (React, .NET), architecture logicielle, IA générative et DevOps.',
      en: 'My portfolio: full-stack development (React, .NET), software architecture, generative AI and DevOps.',
    },
  },
} as const
