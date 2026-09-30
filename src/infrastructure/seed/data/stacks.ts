import { slugify } from '@/domain'
import type { SeedStack } from './types'

/** Même fonction pour le seed et les tests : une référence de stack n'existe que par son slug. */
export const stackSlug = (stack: SeedStack): string => stack.slug ?? slugify(stack.name)

// Uniquement les technologies citées par les CV (FR et IA) ; les `simpleIconSlug` absents de simple-icons sont volontairement omis
// (monogramme) : java→openjdk, et aucune icône pour C#, Twig, Azure, Entra ID, OAuth ni Codex.
export const stacks: readonly SeedStack[] = [
  { name: 'TypeScript', category: 'language', simpleIconSlug: 'typescript', featured: true },
  { name: 'JavaScript', category: 'language', simpleIconSlug: 'javascript' },
  { name: 'C#', slug: 'csharp', category: 'language' },
  { name: 'SQL', category: 'language' },
  { name: 'Python', category: 'language', simpleIconSlug: 'python' },
  { name: 'PHP', category: 'language', simpleIconSlug: 'php' },
  { name: 'Java', category: 'language', simpleIconSlug: 'openjdk' },

  { name: 'React', category: 'frontend', simpleIconSlug: 'react', featured: true },
  { name: 'React Native', category: 'frontend', simpleIconSlug: 'react' },
  { name: 'Expo', category: 'frontend', simpleIconSlug: 'expo' },
  { name: 'Next.js', category: 'frontend', simpleIconSlug: 'nextdotjs' },
  { name: 'Angular', category: 'frontend', simpleIconSlug: 'angular' },
  { name: 'Tailwind CSS', category: 'frontend', simpleIconSlug: 'tailwindcss' },
  { name: 'Figma', category: 'frontend', simpleIconSlug: 'figma' },
  { name: 'PrimeNG', category: 'frontend', simpleIconSlug: 'primeng' },
  { name: 'Twig', category: 'frontend' },

  { name: '.NET', slug: 'dotnet', category: 'backend', simpleIconSlug: 'dotnet', featured: true },
  { name: 'ASP.NET Core', slug: 'aspnet-core', category: 'backend', simpleIconSlug: 'dotnet' },
  { name: 'Entity Framework Core', category: 'backend' },
  { name: 'Symfony', category: 'backend', simpleIconSlug: 'symfony' },
  { name: 'MySQL', category: 'backend', simpleIconSlug: 'mysql' },

  { name: 'Clean Architecture', category: 'architecture' },
  { name: 'DDD', category: 'architecture' },
  { name: 'Architecture hexagonale', category: 'architecture' },
  { name: 'SOLID', category: 'architecture' },

  { name: 'xUnit', category: 'testing' },
  { name: 'NUnit', category: 'testing' },
  { name: 'NSubstitute', category: 'testing' },

  { name: 'Docker', category: 'devops', simpleIconSlug: 'docker', featured: true },
  { name: 'GitHub Actions', category: 'devops', simpleIconSlug: 'githubactions' },
  { name: 'Azure DevOps', category: 'devops' },
  { name: 'Microsoft Azure', category: 'devops', featured: true },
  { name: 'Git', category: 'devops', simpleIconSlug: 'git' },

  { name: 'OAuth 2.0', category: 'security' },
  { name: 'Microsoft Entra ID', category: 'security' },
  { name: 'JWT', category: 'security', simpleIconSlug: 'jsonwebtokens' },

  { name: 'Claude', category: 'ai', simpleIconSlug: 'claude', featured: true },
  { name: 'OpenAI Codex', category: 'ai' },
  { name: 'MCP', category: 'ai', simpleIconSlug: 'modelcontextprotocol' },
  { name: 'RAG', category: 'ai' },
  { name: 'Agents LLM', category: 'ai' },
]
