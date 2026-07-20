// =============================================================================
// Training Plan - Constants Tests
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  DISTANCE_CONFIGS,
  WORKOUT_TEMPLATES,
  TAPER_CURVES,
  POLARIZED_BIAS,
  WEEKLY_GROWTH_CAP,
  WEEKLY_DAY_PATTERNS,
  EXPERIENCE_PACE_BASELINE,
  GOAL_INTENSITY_MODIFIERS,
  GOAL_PACE_MODIFIERS
} from './constants'

describe('DISTANCE_CONFIGS', () => {
  it('covers all race distances the app supports', () => {
    const expected = [3, 5, 7, 10, 15, 21, 42]
    for (const d of expected) {
      expect(DISTANCE_CONFIGS[d]).toBeDefined()
      expect(DISTANCE_CONFIGS[d].label).toBeTruthy()
    }
  })

  it('longer races have more weeks of training', () => {
    expect(DISTANCE_CONFIGS[3].weeks).toBeLessThan(DISTANCE_CONFIGS[10].weeks)
    expect(DISTANCE_CONFIGS[10].weeks).toBeLessThan(DISTANCE_CONFIGS[21].weeks)
    expect(DISTANCE_CONFIGS[21].weeks).toBeLessThan(DISTANCE_CONFIGS[42].weeks)
  })

  it('peak volume grows with race distance', () => {
    expect(DISTANCE_CONFIGS[3].peakWeeklyVolume).toBeLessThan(DISTANCE_CONFIGS[42].peakWeeklyVolume)
  })

  it('max long run ratio is bounded between 0 and 1', () => {
    for (const cfg of Object.values(DISTANCE_CONFIGS)) {
      expect(cfg.maxLongRunRatio).toBeGreaterThan(0)
      expect(cfg.maxLongRunRatio).toBeLessThanOrEqual(1)
    }
  })
})

describe('WORKOUT_TEMPLATES', () => {
  it('defines every workout type', () => {
    const types: Array<keyof typeof WORKOUT_TEMPLATES> = [
      'easy', 'steady', 'tempo', 'intervals', 'long_run', 'recovery', 'cross', 'race'
    ]
    for (const t of types) {
      expect(WORKOUT_TEMPLATES[t]).toBeDefined()
      expect(WORKOUT_TEMPLATES[t].name).toBeTruthy()
    }
  })

  it('marks hard workouts (tempo, intervals, race) as isHard', () => {
    expect(WORKOUT_TEMPLATES.tempo.isHard).toBe(true)
    expect(WORKOUT_TEMPLATES.intervals.isHard).toBe(true)
    expect(WORKOUT_TEMPLATES.race.isHard).toBe(true)
  })

  it('marks easy/recovery/long_run as not hard', () => {
    expect(WORKOUT_TEMPLATES.easy.isHard).toBe(false)
    expect(WORKOUT_TEMPLATES.recovery.isHard).toBe(false)
    expect(WORKOUT_TEMPLATES.long_run.isHard).toBe(false)
  })

  it('intensity values are within 1-10', () => {
    for (const t of Object.values(WORKOUT_TEMPLATES)) {
      expect(t.intensity).toBeGreaterThanOrEqual(1)
      expect(t.intensity).toBeLessThanOrEqual(10)
    }
  })
})

describe('TAPER_CURVES', () => {
  it('marathon has the longest taper (>= 3 weeks)', () => {
    expect(TAPER_CURVES[42].length).toBeGreaterThanOrEqual(3)
  })

  it('shorter races have shorter tapers', () => {
    expect(TAPER_CURVES[3].length).toBeLessThanOrEqual(1)
  })

  it('all taper multipliers are between 0 and 1', () => {
    for (const curve of Object.values(TAPER_CURVES)) {
      for (const m of curve) {
        expect(m).toBeGreaterThan(0)
        expect(m).toBeLessThanOrEqual(1)
      }
    }
  })

  it('first taper step (race week) is the most reduced', () => {
    // Race week is taperStep=0, the smallest multiplier
    expect(TAPER_CURVES[42][0]).toBeLessThanOrEqual(TAPER_CURVES[42][1])
    expect(TAPER_CURVES[42][1]).toBeLessThanOrEqual(TAPER_CURVES[42][2])
  })
})

describe('POLARIZED_BIAS', () => {
  it('beginners are more conservative than advanced runners', () => {
    expect(POLARIZED_BIAS.beginner).toBeGreaterThanOrEqual(POLARIZED_BIAS.advanced)
  })

  it('all values are between 0.5 and 1 (50-100% easy)', () => {
    for (const v of Object.values(POLARIZED_BIAS)) {
      expect(v).toBeGreaterThanOrEqual(0.5)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('WEEKLY_GROWTH_CAP', () => {
  it('is the canonical 10% rule', () => {
    expect(WEEKLY_GROWTH_CAP).toBe(0.10)
  })
})

describe('WEEKLY_DAY_PATTERNS', () => {
  it('has patterns for 2-6 days per week', () => {
    for (let n = 2; n <= 6; n++) {
      expect(WEEKLY_DAY_PATTERNS[n]).toBeDefined()
      expect(WEEKLY_DAY_PATTERNS[n].length).toBe(n)
    }
  })

  it('all day values are in 0-6 range (Sun-Sat)', () => {
    for (const pattern of Object.values(WEEKLY_DAY_PATTERNS)) {
      for (const d of pattern) {
        expect(d).toBeGreaterThanOrEqual(0)
        expect(d).toBeLessThanOrEqual(6)
      }
    }
  })

  it('3-day pattern is Mon/Wed/Fri', () => {
    expect(WEEKLY_DAY_PATTERNS[3]).toEqual([1, 3, 5])
  })
})

describe('EXPERIENCE_PACE_BASELINE', () => {
  it('beginners are slower than advanced', () => {
    expect(EXPERIENCE_PACE_BASELINE.beginner).toBeGreaterThan(EXPERIENCE_PACE_BASELINE.advanced)
  })
})

describe('goal modifiers', () => {
  it('compete goal is harder (higher intensity, faster pace) than weight_loss', () => {
    expect(GOAL_INTENSITY_MODIFIERS.compete).toBeGreaterThan(GOAL_INTENSITY_MODIFIERS.weight_loss)
    expect(GOAL_PACE_MODIFIERS.compete).toBeLessThan(GOAL_PACE_MODIFIERS.weight_loss)
  })
})
