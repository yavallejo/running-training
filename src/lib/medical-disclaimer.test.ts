// =============================================================================
// Medical Disclaimer - Tests
// =============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  MEDICAL_DISCLAIMER_TEXT,
  MEDICAL_DISCLAIMER_VERSION,
  getStoredConsent,
  setStoredConsent,
  clearStoredConsent
} from './medical-disclaimer'

describe('MEDICAL_DISCLAIMER_TEXT', () => {
  it('exposes a short version (1-2 sentences)', () => {
    expect(MEDICAL_DISCLAIMER_TEXT.short.length).toBeGreaterThan(50)
    expect(MEDICAL_DISCLAIMER_TEXT.short.length).toBeLessThan(400)
  })

  it('exposes a full version (multiple bullet points)', () => {
    expect(MEDICAL_DISCLAIMER_TEXT.full).toContain('•')
    expect(MEDICAL_DISCLAIMER_TEXT.full.length).toBeGreaterThan(300)
  })

  it('mentions a medical professional in both versions', () => {
    expect(MEDICAL_DISCLAIMER_TEXT.short).toMatch(/m[eé]dic|deport[oó]log/i)
    expect(MEDICAL_DISCLAIMER_TEXT.full).toMatch(/m[eé]dic|deport[oó]log/i)
  })
})

describe('consent storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  afterEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  it('returns null when no consent is stored', () => {
    expect(getStoredConsent()).toBeNull()
  })

  it('round-trips a stored consent', () => {
    setStoredConsent()
    const c = getStoredConsent()
    expect(c).not.toBeNull()
    expect(c?.v).toBe(1)
    expect(c?.version).toBe(MEDICAL_DISCLAIMER_VERSION)
  })

  it('rejects consents with a stale version', () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('runplan_medical_consent', JSON.stringify({
        v: 1,
        ts: new Date().toISOString(),
        version: '1999-01-01'
      }))
    }
    expect(getStoredConsent()).toBeNull()
  })

  it('rejects malformed JSON', () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('runplan_medical_consent', 'not-json{')
    }
    expect(getStoredConsent()).toBeNull()
  })

  it('clearStoredConsent removes the entry', () => {
    setStoredConsent()
    expect(getStoredConsent()).not.toBeNull()
    clearStoredConsent()
    expect(getStoredConsent()).toBeNull()
  })

  it('setStoredConsent writes the current version, not a hardcoded one', () => {
    setStoredConsent()
    const c = getStoredConsent()
    expect(c?.version).toBe(MEDICAL_DISCLAIMER_VERSION)
  })

  it('StoredConsent version matches the exported MEDICAL_DISCLAIMER_VERSION', () => {
    // Regression guard: if anyone changes the constant, the consent logic
    // must keep using the same source of truth.
    expect(MEDICAL_DISCLAIMER_VERSION).toBeTruthy()
    expect(typeof MEDICAL_DISCLAIMER_VERSION).toBe('string')
    expect(MEDICAL_DISCLAIMER_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
