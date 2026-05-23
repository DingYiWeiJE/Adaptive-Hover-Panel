import { describe, it, expect } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('returns the value as-is when it lies within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is less than min', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })

  it('returns max when value is greater than max', () => {
    expect(clamp(42, 0, 10)).toBe(10)
  })

  it('returns the boundary when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns the boundary when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('returns min when min === max regardless of value', () => {
    expect(clamp(7, 5, 5)).toBe(5)
    expect(clamp(-99, 5, 5)).toBe(5)
    expect(clamp(99, 5, 5)).toBe(5)
  })

  it('works correctly within a negative range', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-20, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })
})
