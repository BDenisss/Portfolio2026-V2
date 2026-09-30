import type { SeedProject } from './types'

// Reformulation stricte des puces des CV : aucun chiffre, résultat ni détail inventé.
export const projects: readonly SeedProject[] = [
  {
    slug: 'plateforme-interne-bouygues',
    year: 2024,
    client: 'Bouygues Telecom Business Solutions',
    featured: true,
    stacks: [
      'react-native',
      'expo',
      'typescript',
      'aspnet-core',
      'entity-framework-core',
      'csharp',
      'docker',
      'microsoft-azure',
      'oauth-2-0',
      'microsoft-entra-id',
      'github-actions',
      'azure-devops',
    ],
    title: { fr: 'Application interne web & mobile', en: 'Internal web & mobile application' },
    tagline: {
      fr: 'De l’idéation au produit pré-pilote, en alternance.',
      en: 'From ideation to a pre-pilot product, during my work-study.',
    },
    summary: {
      fr: 'Application web/mobile interne conçue et développée chez Bouygues Telecom Business Solutions, de l’idéation au produit pré-pilote.',
      en: 'An internal web/mobile application designed and built at Bouygues Telecom Business Solutions, from ideation to a pre-pilot product.',
    },
    caseStudy: {
      fr: [
        'Backend : modélisation métier, conception d’API et intégration d’API externes (Google Places, OpenStreetMap Overpass, Microsoft Graph). Le backend .NET est organisé en cinq couches (Domain, Application, Infrastructure, Persistence, WebApi) selon le DDD et l’architecture hexagonale, pour isoler la logique métier.',
        'Tests : tests automatisés xUnit et NSubstitute sur les règles métier et les cas d’usage, avec une documentation des écarts de couverture dans une démarche qualité.',
        'Frontend : React Native, Expo et TypeScript pour iOS, Android et le web, connecté à une API REST sécurisée par OAuth 2.0 (PKCE) et Microsoft Entra ID SSO.',
        'Livraison : conteneurisation avec Docker et docker-compose, déploiement sur Azure App Service et Azure Static Web Apps, stratégie CI/CD avec GitHub Actions et Azure DevOps pour automatiser tests et déploiements.',
      ],
      en: [
        'Backend: business modelling, API design and integration of external APIs (Google Places, OpenStreetMap Overpass, Microsoft Graph). The .NET backend is organized in five layers (Domain, Application, Infrastructure, Persistence, WebApi) following DDD and hexagonal architecture, to isolate business logic.',
        'Tests: automated xUnit and NSubstitute tests on business rules and use cases, with coverage gaps documented as part of a quality approach.',
        'Frontend: React Native, Expo and TypeScript for iOS, Android and the web, connected to a REST API secured with OAuth 2.0 (PKCE) and Microsoft Entra ID SSO.',
        'Delivery: containerization with Docker and docker-compose, deployment to Azure App Service and Azure Static Web Apps, and a CI/CD strategy with GitHub Actions and Azure DevOps to automate tests and deployments.',
      ],
    },
  },
  {
    slug: 'dywikis',
    year: 2022,
    client: 'Projet personnel',
    featured: true,
    stacks: ['php', 'mysql', 'javascript'],
    title: { fr: 'Dywiki’s', en: 'Dywiki’s' },
    tagline: {
      fr: 'Base de données de films, en autonomie.',
      en: 'A film database, built independently.',
    },
    summary: {
      fr: 'Projet personnel (octobre 2022 – janvier 2023) : une base de données de films conçue et développée en autonomie.',
      en: 'Personal project (October 2022 – January 2023): a film database designed and built independently.',
    },
    caseStudy: {
      fr: [
        'Conception du schéma de base de données : tables, clés étrangères et relations.',
        'Développement de l’interface complète en PHP 8.1, MySQL et JavaScript.',
        'Intégration de l’API The Movie Database (TMDB).',
        'Sécurité et performances renforcées grâce à l’indexation de la base de données.',
      ],
      en: [
        'Design of the database schema: tables, foreign keys and relations.',
        'Development of the full interface in PHP 8.1, MySQL and JavaScript.',
        'Integration of The Movie Database (TMDB) API.',
        'Security and performance strengthened through database indexing.',
      ],
    },
  },
  {
    slug: 'supervision-axima',
    year: 2023,
    client: 'Axima Concept',
    featured: true,
    stacks: ['angular', 'primeng', 'java', 'figma'],
    title: { fr: 'Application de supervision', en: 'Supervision application' },
    tagline: {
      fr: 'Application interne, en méthode agile.',
      en: 'An internal application, built the agile way.',
    },
    summary: {
      fr: 'Application interne de supervision développée et maintenue chez Axima Concept, dans un fonctionnement agile et itératif.',
      en: 'An internal supervision application developed and maintained at Axima Concept, in an agile and iterative way of working.',
    },
    caseStudy: {
      fr: [
        'Développement et maintenance des fonctionnalités avec Angular 12, PrimeNG et Java.',
        'Conception de maquettes UI sur Figma pour améliorer la clarté des interfaces et l’expérience utilisateur.',
        'Échanges réguliers avec les utilisateurs finaux pour identifier leurs besoins et adapter les fonctionnalités.',
      ],
      en: [
        'Development and maintenance of the features with Angular 12, PrimeNG and Java.',
        'UI mockups designed in Figma to improve the clarity of the interfaces and the user experience.',
        'Regular exchanges with end users to identify their needs and adapt the features.',
      ],
    },
  },
  {
    slug: 'quiz-ville-de-clamart',
    year: 2023,
    client: 'Ville de Clamart',
    featured: false,
    stacks: ['symfony', 'mysql', 'javascript', 'tailwind-css', 'twig'],
    title: { fr: 'Application de quiz', en: 'Quiz application' },
    tagline: {
      fr: 'Scoring, requêtes SQL et explications automatiques.',
      en: 'Scoring, SQL queries and automatic explanations.',
    },
    summary: {
      fr: 'Contribution à une application web de quiz pour la Ville de Clamart (Symfony, MySQL, JavaScript, Tailwind, Twig).',
      en: 'Contribution to a quiz web application for the City of Clamart (Symfony, MySQL, JavaScript, Tailwind, Twig).',
    },
    caseStudy: {
      fr: [
        'Contribution au développement de l’application, notamment sur les algorithmes de scoring frontend.',
        'Optimisation des transactions et des requêtes SQL pour améliorer la fiabilité et les performances sous charge.',
        'Affichage automatique d’explications associées aux questions du quiz.',
      ],
      en: [
        'Contribution to the development of the application, notably on the frontend scoring algorithms.',
        'Optimization of transactions and SQL queries to improve reliability and performance under load.',
        'Automatic display of explanations attached to the quiz questions.',
      ],
    },
  },
]
