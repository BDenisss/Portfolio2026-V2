import type { SeedExperience } from './types'

// Sources : CV_Denis_Bucspun_2026_FR.pdf et CV_Denis_Bucspun_2026_IA.pdf. Aucun fait n'est ajouté.
export const experiences: readonly SeedExperience[] = [
  {
    key: 'bouygues',
    kind: 'work',
    organization: 'Bouygues Telecom Business Solutions',
    location: 'Île-de-France',
    start: '2024-10-01',
    end: '2026-10-01',
    stacks: [
      'react-native',
      'expo',
      'typescript',
      'dotnet',
      'aspnet-core',
      'csharp',
      'entity-framework-core',
      'ddd',
      'architecture-hexagonale',
      'xunit',
      'nsubstitute',
      'docker',
      'microsoft-azure',
      'github-actions',
      'azure-devops',
      'oauth-2-0',
      'microsoft-entra-id',
      'claude',
      'openai-codex',
      'mcp',
      'rag',
    ],
    role: {
      fr: 'Développeur Full Stack & DevOps (alternance)',
      en: 'Full Stack & DevOps Developer (work-study)',
    },
    summary: {
      fr: 'Conception et développement de solutions internes dans un contexte Logiciel & IA, de l’idée au prototype, jusqu’au déploiement et au run, en lien direct avec les besoins des utilisateurs.',
      en: 'Design and development of internal solutions in a Software & AI context, from idea to prototype through to deployment and run, in direct contact with users’ needs.',
    },
    highlights: {
      fr: [
        'Conception et développement d’une application web/mobile interne, de l’idéation au produit pré-pilote : modélisation métier, conception d’API et intégration d’API externes (Google Places, OpenStreetMap Overpass, Microsoft Graph).',
        'Backend .NET en cinq couches (Domain, Application, Infrastructure, Persistence, WebApi) appliquant le DDD et l’architecture hexagonale pour isoler la logique métier.',
        'Tests automatisés xUnit et NSubstitute sur les règles métier et les cas d’usage, puis documentation des écarts de couverture dans une démarche qualité.',
        'Frontend React Native, Expo et TypeScript pour iOS, Android et le web, connecté à une API REST sécurisée par OAuth 2.0 (PKCE) et Microsoft Entra ID SSO.',
        'Conteneurisation avec Docker et docker-compose, puis déploiement sur Azure App Service et Azure Static Web Apps.',
        'Stratégie CI/CD avec GitHub Actions et Azure DevOps pour automatiser les tests et les déploiements.',
        'Solutions d’IA générative autour des LLM, agents et architectures multi-agents (MCP, RAG, tool calling), avec Claude Code et Codex pour itérer rapidement en gardant une exigence de qualité et de maintenabilité.',
        'Mémoire professionnel sur le passage d’un prototype à un logiciel industrialisable : dette technique, stabilité, maintenabilité et compromis d’architecture.',
      ],
      en: [
        'Design and development of an internal web/mobile application, from ideation to a pre-pilot product: business modelling, API design and integration of external APIs (Google Places, OpenStreetMap Overpass, Microsoft Graph).',
        'A five-layer .NET backend (Domain, Application, Infrastructure, Persistence, WebApi) applying DDD and hexagonal architecture to isolate business logic.',
        'Automated xUnit and NSubstitute tests on business rules and use cases, then documentation of coverage gaps as part of a quality approach.',
        'React Native, Expo and TypeScript frontend for iOS, Android and the web, connected to a REST API secured with OAuth 2.0 (PKCE) and Microsoft Entra ID SSO.',
        'Containerization with Docker and docker-compose, then deployment to Azure App Service and Azure Static Web Apps.',
        'A CI/CD strategy with GitHub Actions and Azure DevOps to automate tests and deployments.',
        'Generative AI solutions around LLMs, agents and multi-agent architectures (MCP, RAG, tool calling), using Claude Code and Codex to iterate quickly while keeping a high bar for quality and maintainability.',
        'Professional thesis on moving from a prototype to industrializable software: technical debt, stability, maintainability and architectural trade-offs.',
      ],
    },
  },
  {
    key: 'axima',
    kind: 'work',
    organization: 'Axima Concept',
    start: '2023-10-01',
    end: '2024-09-01',
    stacks: ['angular', 'primeng', 'java', 'figma'],
    role: { fr: 'Développeur Full Stack (alternance)', en: 'Full Stack Developer (work-study)' },
    summary: {
      fr: 'Application interne de supervision, dans un fonctionnement agile et itératif.',
      en: 'Internal supervision application, in an agile and iterative way of working.',
    },
    highlights: {
      fr: [
        'Développement et maintenance des fonctionnalités d’une application interne de supervision avec Angular 12, PrimeNG et Java.',
        'Conception de maquettes UI sur Figma pour améliorer la clarté des interfaces et l’expérience utilisateur.',
        'Échanges réguliers avec les utilisateurs finaux pour identifier leurs besoins et adapter les fonctionnalités.',
      ],
      en: [
        'Development and maintenance of the features of an internal supervision application with Angular 12, PrimeNG and Java.',
        'UI mockups designed in Figma to improve the clarity of the interfaces and the user experience.',
        'Regular exchanges with end users to identify their needs and adapt the features.',
      ],
    },
  },
  {
    key: 'clamart',
    kind: 'work',
    organization: 'Ville de Clamart',
    start: '2023-02-01',
    end: '2023-06-01',
    stacks: ['symfony', 'mysql', 'javascript', 'tailwind-css', 'twig', 'sql'],
    role: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    summary: {
      fr: 'Application web de quiz : algorithmes de scoring, requêtes SQL et explications automatiques.',
      en: 'Quiz web application: scoring algorithms, SQL queries and automatic explanations.',
    },
    highlights: {
      fr: [
        'Contribution au développement d’une application web de quiz avec Symfony, MySQL, JavaScript, Tailwind et Twig, notamment sur les algorithmes de scoring frontend.',
        'Optimisation des transactions et des requêtes SQL pour améliorer la fiabilité et les performances sous charge.',
        'Affichage automatique d’explications associées aux questions du quiz.',
      ],
      en: [
        'Contribution to a quiz web application built with Symfony, MySQL, JavaScript, Tailwind and Twig, notably on the frontend scoring algorithms.',
        'Optimization of transactions and SQL queries to improve reliability and performance under load.',
        'Automatic display of explanations attached to the quiz questions.',
      ],
    },
  },
  {
    key: 'dywikis',
    kind: 'work',
    organization: 'Projet personnel',
    start: '2022-10-01',
    end: '2023-01-01',
    stacks: ['php', 'mysql', 'javascript', 'sql'],
    role: {
      fr: 'Développeur Full Stack, en autonomie — « Dywiki’s »',
      en: 'Full Stack Developer, self-directed — “Dywiki’s”',
    },
    summary: {
      fr: 'Base de données de films, conçue et développée en autonomie.',
      en: 'A film database, designed and built independently.',
    },
    highlights: {
      fr: [
        'Conception du schéma de base de données (tables, clés étrangères, relations) et développement de l’interface complète en PHP 8.1, MySQL et JavaScript, avec intégration de l’API The Movie Database (TMDB).',
        'Sécurité et performances renforcées grâce à l’indexation de la base de données.',
      ],
      en: [
        'Design of the database schema (tables, foreign keys, relations) and development of the full interface in PHP 8.1, MySQL and JavaScript, with integration of The Movie Database (TMDB) API.',
        'Security and performance strengthened through database indexing.',
      ],
    },
  },
  {
    key: 'iim',
    kind: 'education',
    organization: 'IIM Digital School — Pôle Léonard de Vinci',
    location: 'Paris',
    // Le CV ne donne que les années (2025 - 2026) : rentrée de septembre supposée, à confirmer dans l'admin.
    start: '2025-09-01',
    end: '2026-09-01',
    stacks: [],
    role: {
      fr: 'Master — Ingénierie Web et Innovation Digitale',
      en: 'Master’s degree — Web Engineering & Digital Innovation',
    },
    summary: {
      fr: 'Mémoire professionnel : « De l’innovation interne à l’industrialisation logicielle » — cadres qualité, dette technique et transition du prototype vers un logiciel maintenable.',
      en: 'Professional thesis: “From internal innovation to software industrialization” — quality frameworks, technical debt and the transition from prototype to maintainable software.',
    },
    highlights: { fr: [], en: [] },
  },
]
