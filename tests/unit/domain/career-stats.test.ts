import { describe, expect, it } from 'vitest'
import { computeCareerStats } from '@/domain'

const NOW = new Date('2026-09-30T00:00:00Z')

describe('computeCareerStats', () => {
  it("compte les années depuis la plus ancienne expérience 'work'", () => {
    const stats = computeCareerStats({
      experiences: [
        { kind: 'work', start: '2024-10-01' },
        { kind: 'work', start: '2023-02-01' },
        { kind: 'education', start: '2019-09-01' },
      ],
      projectsCount: 5,
      stacksCount: 34,
      now: NOW,
    })
    expect(stats).toEqual({ years: 3, experiences: 2, technologies: 34, projects: 5 })
  })

  it("renvoie 0 année sans expérience 'work'", () => {
    const stats = computeCareerStats({
      experiences: [],
      projectsCount: 0,
      stacksCount: 0,
      now: NOW,
    })
    expect(stats.years).toBe(0)
  })

  it("ignore les formations pour l'ancienneté", () => {
    const stats = computeCareerStats({
      experiences: [{ kind: 'education', start: '2010-09-01' }],
      projectsCount: 0,
      stacksCount: 0,
      now: NOW,
    })
    expect(stats.years).toBe(0)
  })
})
