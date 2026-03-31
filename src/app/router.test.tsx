import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { AppRouter } from './router'
import { AppStoreProvider } from '../state/store'

const renderAt = (path: string) => {
  return render(
    <AppStoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AppStoreProvider>,
  )
}

describe('router', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders home page at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /zahlenliebe/i })).toBeInTheDocument()
  })

  it('renders love10 mode page', () => {
    renderAt('/mode/love10')
    expect(screen.getByRole('heading', { level: 1, name: /verliebte zahlen/i })).toBeInTheDocument()
  })

  it('renders placevalue mode page', () => {
    renderAt('/mode/placevalue')
    expect(screen.getByRole('heading', { level: 1, name: /zehner & einer/i })).toBeInTheDocument()
  })

  it('renders zerlegen mode page', () => {
    renderAt('/mode/zerlegen')
    expect(screen.getByRole('heading', { level: 1, name: /zerlegen/i })).toBeInTheDocument()
  })
})
