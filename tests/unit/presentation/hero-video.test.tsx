// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroVideo } from '@/presentation/components/cinematic/HeroVideo'

const SOURCES = { mp4: { url: '/v.mp4' }, webm: { url: '/v.webm' } } as never

let rafCallbacks: FrameRequestCallback[] = []
const flushFrame = () => {
  const pending = rafCallbacks
  rafCallbacks = []
  pending.forEach((callback) => callback(0))
}

beforeEach(() => {
  rafCallbacks = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    rafCallbacks.push(callback),
  )
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
})
afterEach(() => vi.unstubAllGlobals())

function mount(props: { active: boolean; onCue: () => void }) {
  const view = render(
    <HeroVideo
      sources={SOURCES}
      poster={null}
      active={props.active}
      visible
      onEnded={() => undefined}
      onCue={props.onCue}
    />,
  )
  const video = view.container.querySelector('video') as HTMLVideoElement
  let time = 0
  Object.defineProperty(video, 'currentTime', { get: () => time, configurable: true })
  return { video, setTime: (value: number) => (time = value) }
}

describe('<HeroVideo>', () => {
  it('ne se lit qu’une fois : pas de boucle, pas de lecture automatique avant d’être à l’écran', () => {
    const { video } = mount({ active: false, onCue: vi.fn() })
    expect(video.loop).toBe(false)
    expect(video.autoplay).toBe(false)
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('lance la lecture dès que le hero est visible', () => {
    mount({ active: true, onCue: vi.fn() })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  })

  it('déclenche le cue une seule fois, à l’image où le temps de lecture atteint 3,5 s', () => {
    const onCue = vi.fn()
    const { setTime } = mount({ active: true, onCue })
    setTime(3.4)
    flushFrame()
    expect(onCue).not.toHaveBeenCalled()
    setTime(3.52)
    flushFrame()
    expect(onCue).toHaveBeenCalledTimes(1)
    setTime(3.9)
    flushFrame()
    expect(onCue).toHaveBeenCalledTimes(1)
  })
})
