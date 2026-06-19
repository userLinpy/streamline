import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatRelativeDate, formatStars } from '@/lib/utils'

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-19T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it("should return aujourd'hui for today", () => {
    expect(formatRelativeDate('2026-06-19T08:00:00Z')).toBe("aujourd'hui")
  })

  it('should return il y a 1 jour for yesterday', () => {
    expect(formatRelativeDate('2026-06-18T08:00:00Z')).toBe('il y a 1 jour')
  })

  it('should return il y a N jours for a few days ago', () => {
    expect(formatRelativeDate('2026-06-16T08:00:00Z')).toBe('il y a 3 jours')
  })

  it('should return il y a 1 semaine for 7-13 days ago', () => {
    expect(formatRelativeDate('2026-06-12T08:00:00Z')).toBe('il y a 1 semaine')
  })

  it('should return il y a N semaines for older dates', () => {
    expect(formatRelativeDate('2026-06-05T08:00:00Z')).toBe('il y a 2 semaines')
  })
})

describe('formatStars', () => {
  it('should return plain number for < 1000', () => {
    expect(formatStars(342)).toBe('342')
    expect(formatStars(0)).toBe('0')
  })

  it('should return Xk format for >= 1000', () => {
    expect(formatStars(1000)).toBe('1.0k')
    expect(formatStars(12500)).toBe('12.5k')
    expect(formatStars(82300)).toBe('82.3k')
  })
})
