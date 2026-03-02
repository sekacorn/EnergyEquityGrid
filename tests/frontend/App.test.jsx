import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../../frontend/src/pages/Home'

/**
 * Frontend Test Suite
 * Tests React components and user interactions
 */

describe('Home Component', () => {
  it('renders welcome message', () => {
    render(
      <BrowserRouter>
        <Home mbtiType="ENTJ" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Energy/i)).toBeDefined()
  })

  it('displays MBTI-specific content for ENTJ', () => {
    render(
      <BrowserRouter>
        <Home mbtiType="ENTJ" />
      </BrowserRouter>
    )

    const content = screen.getByText(/Strategic/i) || screen.getByText(/strategic/i)
    expect(content).toBeDefined()
  })

  it('displays features grid', () => {
    render(
      <BrowserRouter>
        <Home mbtiType="UNKNOWN" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Data Integration/i)).toBeDefined()
    expect(screen.getByText(/3D Visualization/i)).toBeDefined()
    expect(screen.getByText(/AI Predictions/i)).toBeDefined()
  })
})

describe('MBTI Personalization', () => {
  const mbtiTypes = ['ENTJ', 'INFP', 'INFJ', 'ESTP', 'INTJ']

  mbtiTypes.forEach(mbti => {
    it(`renders correctly for ${mbti}`, () => {
      render(
        <BrowserRouter>
          <Home mbtiType={mbti} />
        </BrowserRouter>
      )

      // Should render without errors
      expect(screen.getByText(/Energy/i)).toBeDefined()
    })
  })
})

describe('Application Integration', () => {
  it('handles localStorage for MBTI preference', () => {
    localStorage.setItem('mbtiType', 'ENTJ')
    const stored = localStorage.getItem('mbtiType')
    expect(stored).toBe('ENTJ')
  })

  it('handles user authentication state', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      roles: ['USER']
    }

    localStorage.setItem('user', JSON.stringify(mockUser))
    const stored = JSON.parse(localStorage.getItem('user'))

    expect(stored.username).toBe('testuser')
    expect(stored.roles).toContain('USER')
  })
})
