// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/presentation/components/ui/Button'

describe('<Button>', () => {
  it('rend un <a> avec href', () => {
    render(<Button href="#x">Go</Button>)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#x')
  })
  it('rend un <button type=button> sans href', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button')
  })
  it('garantit une cible tactile ≥ 44px (min-h-11)', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button').className).toMatch(/min-h-11/)
  })
  it('masque l’icône décorative aux lecteurs d’écran', () => {
    const { container } = render(<Button icon="arrow-up-right">Go</Button>)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
