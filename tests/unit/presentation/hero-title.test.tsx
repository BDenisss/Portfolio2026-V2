// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HeroChoreographyProvider,
  useHeroChoreography,
} from '@/presentation/cinematic/hero-choreography-context'
import { RotatingTitle } from '@/presentation/components/sections/hero/RotatingTitle'

const TITLES = ['Développeur Full Stack', 'Ingénieur Logiciel IA / GenAI']
const ROTATION_MS = 3200

/** Expose les commandes de la chorégraphie pour que le test joue le rôle de la vidéo du hero. */
function Remote({ onReady }: { onReady: (api: ReturnType<typeof useHeroChoreography>) => void }) {
  onReady(useHeroChoreography())
  return null
}

// Le titre affiché est le premier <span aria-hidden> du paragraphe (l'ancien titre et les étincelles le suivent).
const visibleTitle = () => document.querySelector('p span[aria-hidden="true"]')?.textContent

describe('<RotatingTitle> sans chorégraphie (rotation classique)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('affiche le premier titre puis alterne', () => {
    render(<RotatingTitle titles={TITLES} label="Mes métiers :" />)
    expect(visibleTitle()).toBe(TITLES[0])
    act(() => void vi.advanceTimersByTime(ROTATION_MS))
    expect(visibleTitle()).toBe(TITLES[1])
  })
})

describe('<RotatingTitle> piloté par la vidéo du hero', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const setup = () => {
    let api!: ReturnType<typeof useHeroChoreography>
    render(
      <HeroChoreographyProvider>
        <Remote onReady={(value) => (api = value)} />
        <RotatingTitle titles={TITLES} label="Mes métiers :" />
      </HeroChoreographyProvider>,
    )
    return () => api
  }

  it('n’alterne plus tout seul : il attend le cling de la vidéo', () => {
    const remote = setup()
    act(() => remote().arm())
    act(() => void vi.advanceTimersByTime(ROTATION_MS * 3))
    expect(visibleTitle()).toBe(TITLES[0])
  })

  it('se transforme au cling en « Ingénieur Logiciel IA / GenAI » et s’y arrête', () => {
    const remote = setup()
    act(() => remote().arm())
    act(() => remote().swap())
    expect(visibleTitle()).toBe(TITLES[1])
    act(() => void vi.advanceTimersByTime(ROTATION_MS * 3))
    expect(visibleTitle()).toBe(TITLES[1])
  })

  it('garde le texte lisible par les lecteurs d’écran : tous les titres restent annoncés', () => {
    const remote = setup()
    act(() => remote().arm())
    act(() => remote().swap())
    expect(screen.getByText(/Mes métiers :/)).toHaveTextContent(TITLES.join(', '))
  })

  it('reprend la rotation si la vidéo n’est plus à l’écran (désarmée avant le cling)', () => {
    const remote = setup()
    act(() => remote().arm())
    act(() => remote().disarm())
    act(() => void vi.advanceTimersByTime(ROTATION_MS))
    expect(visibleTitle()).toBe(TITLES[1])
  })
})
