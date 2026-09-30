// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Glass } from '@/presentation/components/glass/Glass'

describe('<Glass>', () => {
  it('rend un div .glass avec la variante par défaut card', () => {
    render(<Glass data-testid="g">x</Glass>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveClass('glass', 'glass--card')
    expect(el).toHaveAttribute('data-glass', 'card')
  })
  it('respecte as, variant, interactive et refract', () => {
    render(
      <Glass as="a" href="#x" variant="pill" interactive refract data-testid="g">
        go
      </Glass>,
    )
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('A')
    expect(el).toHaveClass('glass--pill')
    expect(el).toHaveAttribute('data-interactive', 'true')
    expect(el).toHaveAttribute('data-refract', 'true')
    expect(el).toHaveAttribute('href', '#x')
  })
  it("n'ajoute pas data-refract/data-interactive par défaut", () => {
    render(<Glass data-testid="g" />)
    expect(screen.getByTestId('g')).not.toHaveAttribute('data-refract')
    expect(screen.getByTestId('g')).not.toHaveAttribute('data-interactive')
  })
})
