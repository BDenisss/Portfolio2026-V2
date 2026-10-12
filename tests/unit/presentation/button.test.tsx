// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/presentation/components/ui/Button'

describe('<Button>', () => {
  it('rend un <a> avec href', () => {
    render(<Button href="#x">Go</Button>)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#x')
  })
  it('ne préfixe jamais la langue devant un fichier de l’API ni un téléchargement', () => {
    render(
      <>
        <Button href="/api/media/file/cv.pdf" download>
          CV
        </Button>
        <Button href="/api/media/file/doc.pdf">Doc</Button>
      </>,
    )
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute(
      'href',
      '/api/media/file/cv.pdf',
    )
    expect(screen.getByRole('link', { name: 'Doc' })).toHaveAttribute(
      'href',
      '/api/media/file/doc.pdf',
    )
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
