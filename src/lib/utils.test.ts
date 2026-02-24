import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges tailwind classes correctly', () => {
    // tailwind-merge should resolve conflicts
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('resolves conflicting tailwind utilities', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
