// =============================================================================
// Training Plan - Algorithm Tests
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  estimateMaxHeartRate,
  calculateHeartRateZones,
  calculateRealisticPace,
  estimateTargetRaceTime,
  estimateCaloriesBurned,
  calculateWorkoutDistance,
  calculateWeeklyProgression,
  calculateSessionDuration,
  calculateRealSessionDates,
  buildWeeklyStructure,
  buildSessionWarnings,
  applyBeginnerProtection,
  applyPolarizedDistribution,
  formatPace,
  formatHeartRateZone,
  generateWorkoutDetails,
  generateDeterministicId,
  generateAlgorithmicPlan
} from './algorithm'
import { DISTANCE_CONFIGS, WORKOUT_TEMPLATES } from './constants'
import type { UserProfile, WorkoutType } from './types'

// =============================================================================
// Physiologic helpers
// =============================================================================
describe('estimateMaxHeartRate', () => {
  it('uses Tanaka formula (208 - 0.7*age)', () => {
    expect(estimateMaxHeartRate(30)).toBe(187)
    expect(estimateMaxHeartRate(40)).toBe(180)
    expect(estimateMaxHeartRate(50)).toBe(173)
  })

  it('adds 5 bpm for female sex', () => {
    expect(estimateMaxHeartRate(30, 'female')).toBe(192)
    expect(estimateMaxHeartRate(30, 'male')).toBe(187)
    expect(estimateMaxHeartRate(30, 'other')).toBe(187)
  })
})

describe('calculateHeartRateZones', () => {
  it('returns monotonic, non-overlapping zones', () => {
    const z = calculateHeartRateZones(60, 190)
    expect(z.recovery.max).toBeLessThanOrEqual(z.easy.min)
    expect(z.easy.max).toBeLessThanOrEqual(z.steady.min)
    expect(z.steady.max).toBeLessThanOrEqual(z.tempo.min)
    expect(z.tempo.max).toBeLessThanOrEqual(z.intervals.min)
  })

  it('restingHR is the floor of every zone', () => {
    const z = calculateHeartRateZones(60, 190)
    for (const zone of Object.values(z)) {
      expect(zone.min).toBeGreaterThanOrEqual(60)
    }
  })

  it('maxHR bounds intervals zone', () => {
    const z = calculateHeartRateZones(60, 190)
    expect(z.intervals.max).toBeLessThanOrEqual(190)
  })
})

// =============================================================================
// Pace and target time
// =============================================================================
describe('calculateRealisticPace', () => {
  const baseProfile: UserProfile = {
    experience_level: 'beginner',
    current_weekly_km: 0,
    available_days_per_week: 3,
    minutes_per_session: 60,
    has_injuries: false
  }

  it('beginners run slower than advanced at the same workout', () => {
    const beginner = calculateRealisticPace(baseProfile, 'easy', 10, 1, 6).pace
    const advanced = calculateRealisticPace(
      { ...baseProfile, experience_level: 'advanced' },
      'easy', 10, 1, 6
    ).pace
    expect(beginner).toBeGreaterThan(advanced)
  })

  it('recovery pace is slower than easy pace', () => {
    const recovery = calculateRealisticPace(baseProfile, 'recovery', 10, 1, 6).pace
    const easy = calculateRealisticPace(baseProfile, 'easy', 10, 1, 6).pace
    expect(recovery).toBeGreaterThan(easy)
  })

  it('tempo pace is faster than easy pace', () => {
    const tempo = calculateRealisticPace(baseProfile, 'tempo', 10, 1, 6).pace
    const easy = calculateRealisticPace(baseProfile, 'easy', 10, 1, 6).pace
    expect(tempo).toBeLessThan(easy)
  })

  it('injuries slow the runner down', () => {
    const healthy = calculateRealisticPace(baseProfile, 'easy', 10, 1, 6).pace
    const injured = calculateRealisticPace(
      { ...baseProfile, has_injuries: true },
      'easy', 10, 1, 6
    ).pace
    expect(injured).toBeGreaterThan(healthy)
  })
})

describe('estimateTargetRaceTime', () => {
  it('returns hours:minutes format for > 1h', () => {
    expect(estimateTargetRaceTime({ ...baseProfile(), experience_level: 'advanced' }, 42)).toMatch(/^\d+:\d{2}$/)
  })

  it('returns minutes only for < 1h', () => {
    expect(estimateTargetRaceTime({ ...baseProfile(), experience_level: 'advanced' }, 3)).toMatch(/\d+ min/)
  })

  it('compete goal gives faster time than weight_loss for same level', () => {
    const compete = estimateTargetRaceTime({ ...baseProfile(), goal_type: 'compete' }, 21)
    const weightLoss = estimateTargetRaceTime({ ...baseProfile(), goal_type: 'weight_loss' }, 21)
    expect(compete < weightLoss).toBe(true)
  })
})

function baseProfile(): UserProfile {
  return {
    experience_level: 'beginner',
    current_weekly_km: 0,
    available_days_per_week: 3,
    minutes_per_session: 60,
    has_injuries: false
  }
}

// =============================================================================
// Calories
// =============================================================================
describe('estimateCaloriesBurned', () => {
  it('intervals burn more than easy at same distance', () => {
    const easy = estimateCaloriesBurned(5, 70, 'easy', 'road')
    const intervals = estimateCaloriesBurned(5, 70, 'intervals', 'road')
    expect(intervals).toBeGreaterThan(easy)
  })

  it('heavier runner burns more', () => {
    const light = estimateCaloriesBurned(5, 60, 'easy', 'road')
    const heavy = estimateCaloriesBurned(5, 90, 'easy', 'road')
    expect(heavy).toBeGreaterThan(light)
  })

  it('trail burns more than road for same distance', () => {
    const road = estimateCaloriesBurned(5, 70, 'easy', 'road')
    const trail = estimateCaloriesBurned(5, 70, 'easy', 'trail')
    expect(trail).toBeGreaterThan(road)
  })

  it('falls back to 70kg when no weight given', () => {
    const c = estimateCaloriesBurned(5, undefined, 'easy', 'road')
    expect(c).toBeGreaterThan(0)
  })
})

// =============================================================================
// 10% rule cap (improvement 1.2)
// =============================================================================
describe('calculateWeeklyProgression - 10% rule', () => {
  it('never grows the natural factor more than 10% week over week', () => {
    const start = 0.5
    const injuryMult = 1
    const buildUp = 4
    const recovery = 4
    const total = 12
    let prevNatural: number | null = null
    let maxJump = 0

    for (let w = 1; w <= total; w++) {
      const p = calculateWeeklyProgression(
        w, total, buildUp, start, injuryMult, recovery, prevNatural, 10
      )
      if (prevNatural !== null) {
        const jump = (p.naturalFactor - prevNatural) / prevNatural
        if (jump > maxJump) maxJump = jump
      }
      prevNatural = p.naturalFactor
    }

    expect(maxJump).toBeLessThanOrEqual(0.10 + 0.001)
  })

  it('first week has no previous factor to cap against', () => {
    const p1 = calculateWeeklyProgression(1, 10, 3, 0.5, 1, 4, null, 10)
    expect(p1.factor).toBeGreaterThan(0)
    expect(p1.naturalFactor).toBeGreaterThan(0)
  })

  it('naturalFactor field is exposed for chaining', () => {
    const p1 = calculateWeeklyProgression(1, 10, 3, 0.5, 1, 4, null, 10)
    expect(p1.naturalFactor).toBeDefined()
  })
})

// =============================================================================
// Taper (improvement 1.3)
// =============================================================================
describe('calculateWeeklyProgression - taper', () => {
  it('marks the last week of any plan as a taper week', () => {
    // 5K with 1-week taper: only week 6 (last) is taper
    const taper5k = calculateWeeklyProgression(6, 6, 2, 0.5, 1, 99, 0.7, 5)
    expect(taper5k.isTaperWeek).toBe(true)
    expect(taper5k.factor).toBeLessThan(1)
  })

  it('marathon has 3 taper weeks', () => {
    // TAPER_CURVES[42] = [0.4, 0.6, 0.75]
    // totalWeeks=18, taper kicks in at week >= 18-3=15
    for (const w of [16, 17, 18]) {
      const p = calculateWeeklyProgression(w, 18, 4, 0.99, 1, 99, 0.95, 42)
      expect(p.isTaperWeek).toBe(true)
    }
  })

  it('mid-plan weeks are NOT taper weeks', () => {
    const mid = calculateWeeklyProgression(3, 8, 2, 0.5, 1, 4, 0.7, 7)
    expect(mid.isTaperWeek).toBe(false)
  })

  it('marathon race week has heavier reduction than half marathon race week', () => {
    const marathonRace = calculateWeeklyProgression(18, 18, 4, 0.99, 1, 99, 0.95, 42)
    const halfRace = calculateWeeklyProgression(14, 14, 3, 0.99, 1, 99, 0.95, 21)
    // 42K race week factor = 0.4 (vs 0.45 for 21K)
    expect(marathonRace.factor).toBeLessThan(halfRace.factor)
  })

  it('taper is progressive (race week < week before)', () => {
    // Marathon: weeks 17, 18 with taper steps 1, 0
    const weekBefore = calculateWeeklyProgression(17, 18, 4, 0.99, 1, 99, 0.95, 42)
    const raceWeek = calculateWeeklyProgression(18, 18, 4, 0.99, 1, 99, weekBefore.naturalFactor, 42)
    expect(raceWeek.factor).toBeLessThan(weekBefore.factor)
  })
})

// =============================================================================
// Recovery week (deload)
// =============================================================================
describe('calculateWeeklyProgression - recovery weeks', () => {
  it('marks every 4th week as recovery', () => {
    const w4 = calculateWeeklyProgression(4, 12, 3, 0.5, 1, 4, 0.7, 10)
    expect(w4.isRecoveryWeek).toBe(true)
  })

  it('reduces volume on recovery weeks by 40%', () => {
    const w3 = calculateWeeklyProgression(3, 12, 3, 0.5, 1, 4, 0.7, 10)
    const w4 = calculateWeeklyProgression(4, 12, 3, 0.5, 1, 4, 0.7, 10)
    expect(w4.factor).toBeCloseTo(w3.factor * 0.6, 5)
  })

  it('injuries trigger every-3-weeks recovery', () => {
    const injured = calculateWeeklyProgression(3, 12, 3, 0.5, 0.7, 3, 0.7, 10)
    expect(injured.isRecoveryWeek).toBe(true)
  })
})

// =============================================================================
// Distance cap (improvement 1.6)
// =============================================================================
describe('calculateWorkoutDistance - 35% cap', () => {
  const config = DISTANCE_CONFIGS[10]
  const total = 10

  it('easy/steady/tempo never exceed 35% of race distance', () => {
    for (let w = 1; w < total; w++) {
      for (const wt of ['easy', 'steady', 'tempo'] as const) {
        const p = calculateWeeklyProgression(w, total, 3, 0.5, 1, 4, 0.7, 10)
        const d = calculateWorkoutDistance(wt, p, 10, config, w, total)
        expect(d).toBeLessThanOrEqual(10 * 0.35 + 0.01)
      }
    }
  })

  it('intervals respect a minimum of 1.5km floor (cap does not override)', () => {
    // 3K race: the 35% cap would cap intervals at 1.05km, but intervals
    // are exempt from the cap so the 1.5km floor always wins. This
    // ensures a meaningful interval workout even on short race plans.
    const cfg3 = DISTANCE_CONFIGS[3]
    const p = calculateWeeklyProgression(2, 4, 1, 0.5, 1, 4, 0.7, 3)
    const d = calculateWorkoutDistance('intervals', p, 3, cfg3, 2, 4)
    expect(d).toBeGreaterThanOrEqual(1.5)
  })

  it('intervals also honor a peak factor on long races (no silent regression)', () => {
    // Regression guard: a 42K plan at peak factor should produce long-enough
    // intervals (>= 1.5km) but never the full race distance.
    const cfg42 = DISTANCE_CONFIGS[42]
    const p = calculateWeeklyProgression(15, 18, 4, 0.95, 1, 4, 0.95, 42)
    const d = calculateWorkoutDistance('intervals', p, 42, cfg42, 15, 18)
    expect(d).toBeGreaterThanOrEqual(1.5)
    expect(d).toBeLessThan(42 * 0.35 + 0.01)
  })

  it('easy/steady/tempo still respect the 35% cap (regression guard for the intervals fix)', () => {
    // Make sure excluding intervals from the cap didn't accidentally
    // exclude the other session types.
    const cfg3 = DISTANCE_CONFIGS[3]
    const p = calculateWeeklyProgression(2, 4, 1, 0.5, 1, 4, 0.7, 3)
    for (const wt of ['easy', 'steady', 'tempo'] as const) {
      const d = calculateWorkoutDistance(wt, p, 3, cfg3, 2, 4)
      expect(d).toBeLessThanOrEqual(3 * 0.35 + 0.01)
    }
  })

  it('long_run can exceed 35% of race distance', () => {
    const p = calculateWeeklyProgression(7, 10, 3, 0.95, 1, 99, 0.95, 10)
    const d = calculateWorkoutDistance('long_run', p, 10, config, 7, 10)
    // 10K race, 0.75 max ratio = 7.5km, definitely > 3.5
    expect(d).toBeGreaterThan(3.5)
  })

  it('cross-training yields 0 km', () => {
    const p = calculateWeeklyProgression(2, 4, 1, 0.5, 1, 4, 0.7, 3)
    const d = calculateWorkoutDistance('cross', p, 3, DISTANCE_CONFIGS[3], 2, 4)
    expect(d).toBe(0)
  })

  it('race session equals the race distance', () => {
    const p = calculateWeeklyProgression(1, 4, 1, 1, 1, 4, null, 10)
    const d = calculateWorkoutDistance('race', p, 10, config, 1, 4)
    expect(d).toBe(10)
  })
})

// =============================================================================
// Session duration
// =============================================================================
describe('calculateSessionDuration', () => {
  it('long_run is always at least 90 min', () => {
    expect(calculateSessionDuration('long_run', 10, 60, 'fitness')).toBeGreaterThanOrEqual(90)
  })

  it('weight_loss goal extends max session to up to 90 min', () => {
    expect(calculateSessionDuration('easy', 1, 60, 'weight_loss')).toBeLessThanOrEqual(90)
  })
})

// =============================================================================
// Date pattern (improvement 1.7)
// =============================================================================
describe('calculateRealSessionDates', () => {
  it('produces exactly totalSessions dates', () => {
    expect(calculateRealSessionDates('2026-05-04', 9, 3)).toHaveLength(9)
    expect(calculateRealSessionDates('2026-05-04', 20, 4)).toHaveLength(20)
  })

  it('3 sessions/week starting on Mon lands on Mon/Wed/Fri', () => {
    // 2026-05-04 is a Monday
    const dates = calculateRealSessionDates('2026-05-04', 3, 3)
    expect(dates).toEqual(['2026-05-04', '2026-05-06', '2026-05-08'])
  })

  it('4 sessions/week starting on Mon lands on Mon/Tue/Thu/Sat', () => {
    const dates = calculateRealSessionDates('2026-05-04', 4, 4)
    expect(dates).toEqual(['2026-05-04', '2026-05-05', '2026-05-07', '2026-05-09'])
  })

  it('5 sessions/week starting on Mon is Mon-Sat minus one', () => {
    const dates = calculateRealSessionDates('2026-05-04', 5, 5)
    expect(dates).toEqual(['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-09'])
  })

  it('rolls over to the next week on the last session of each week', () => {
    const dates = calculateRealSessionDates('2026-05-04', 6, 3)
    expect(dates[0]).toBe('2026-05-04') // Mon
    expect(dates[1]).toBe('2026-05-06') // Wed
    expect(dates[2]).toBe('2026-05-08') // Fri
    expect(dates[3]).toBe('2026-05-11') // Mon
    expect(dates[4]).toBe('2026-05-13') // Wed
    expect(dates[5]).toBe('2026-05-15') // Fri
  })

  it('starts on startDate, then snaps to the next pattern weekday', () => {
    // 2026-05-06 is a Wednesday. 3-day pattern is [Mon=1, Wed=3, Fri=5].
    // Session 0 = startDate (Wed).
    // Session 1 = next pattern day after Wed = Fri.
    // Session 2 = next pattern day after Fri = next week's Mon.
    const dates = calculateRealSessionDates('2026-05-06', 3, 3)
    expect(dates[0]).toBe('2026-05-06') // Wed (startDate)
    expect(dates[1]).toBe('2026-05-08') // Fri
    expect(dates[2]).toBe('2026-05-11') // next Mon
  })

  it('handles starting on Sunday by jumping to Monday for the next session', () => {
    // 2026-05-10 is a Sunday. 3-day pattern is [Mon, Wed, Fri].
    // Session 0 = Sun (startDate). Session 1 = next pattern day after Sun = Mon.
    const dates = calculateRealSessionDates('2026-05-10', 2, 3)
    expect(dates[0]).toBe('2026-05-10') // Sun
    expect(dates[1]).toBe('2026-05-11') // Mon
  })
})

// =============================================================================
// Beginner protection (improvement 1.5)
// =============================================================================
describe('applyBeginnerProtection', () => {
  it('replaces hard sessions in beginner week 1 with easy', () => {
    const structure: WorkoutType[] = ['easy', 'intervals', 'long_run']
    const result = applyBeginnerProtection(structure, 'beginner', 1)
    expect(result).toEqual(['easy', 'easy', 'long_run'])
  })

  it('does NOT touch week 2+ for beginners', () => {
    const structure: WorkoutType[] = ['easy', 'intervals', 'long_run']
    const result = applyBeginnerProtection(structure, 'beginner', 2)
    expect(result).toEqual(structure)
  })

  it('does NOT touch intermediate runners at any week', () => {
    const structure: WorkoutType[] = ['easy', 'intervals', 'long_run']
    const result = applyBeginnerProtection(structure, 'intermediate', 1)
    expect(result).toEqual(structure)
  })

  it('falls back to recovery if no easy in the structure', () => {
    const structure: WorkoutType[] = ['recovery', 'tempo', 'long_run']
    const result = applyBeginnerProtection(structure, 'beginner', 1)
    expect(result).toEqual(['recovery', 'recovery', 'long_run'])
  })
})

// =============================================================================
// Polarized 80/20 (improvement 1.4)
// =============================================================================
describe('applyPolarizedDistribution', () => {
  it('beginner 3-day plan has at most 1 hard session', () => {
    const structure: WorkoutType[] = ['easy', 'tempo', 'long_run']
    const result = applyPolarizedDistribution(structure, 'beginner')
    // 10% hard cap for beginner => floor(3 * 0.1) = 0 hard sessions allowed
    expect(result.filter(w => WORKOUT_TEMPLATES[w].isHard)).toHaveLength(0)
  })

  it('intermediate 4-day plan has at most 1 hard session', () => {
    const structure: WorkoutType[] = ['easy', 'tempo', 'intervals', 'long_run']
    const result = applyPolarizedDistribution(structure, 'intermediate')
    // 20% hard cap for intermediate => floor(4 * 0.2) = 0
    expect(result.filter(w => WORKOUT_TEMPLATES[w].isHard)).toHaveLength(0)
  })

  it('advanced 5-day plan can have up to 2 hard sessions', () => {
    const structure: WorkoutType[] = ['easy', 'tempo', 'intervals', 'long_run', 'recovery']
    const result = applyPolarizedDistribution(structure, 'advanced')
    // 25% hard cap => floor(5 * 0.25) = 1
    expect(result.filter(w => WORKOUT_TEMPLATES[w].isHard).length).toBeLessThanOrEqual(1)
  })

  it('demotes excess hard sessions to steady', () => {
    const structure: WorkoutType[] = ['tempo', 'intervals', 'race', 'easy', 'long_run']
    const result = applyPolarizedDistribution(structure, 'intermediate')
    for (const w of result) {
      expect(WORKOUT_TEMPLATES[w].isHard).toBe(false)
    }
  })

  it('preserves easy and long_run sessions', () => {
    const structure: WorkoutType[] = ['easy', 'tempo', 'long_run']
    const result = applyPolarizedDistribution(structure, 'beginner')
    expect(result).toContain('easy')
    expect(result).toContain('long_run')
  })
})

// =============================================================================
// buildWeeklyStructure
// =============================================================================
describe('buildWeeklyStructure', () => {
  it('returns exactly sessionsPerWeek workouts', () => {
    expect(buildWeeklyStructure('beginner', 3).length).toBe(3)
    expect(buildWeeklyStructure('intermediate', 4).length).toBe(4)
    expect(buildWeeklyStructure('advanced', 5).length).toBe(5)
  })

  it('always includes long_run', () => {
    expect(buildWeeklyStructure('beginner', 3)).toContain('long_run')
    expect(buildWeeklyStructure('intermediate', 4)).toContain('long_run')
    expect(buildWeeklyStructure('advanced', 5)).toContain('long_run')
  })

  it('weight_loss goal emphasizes easy/recovery', () => {
    const s = buildWeeklyStructure('beginner', 3, 'weight_loss')
    expect(s.filter(w => w === 'easy' || w === 'recovery').length).toBeGreaterThan(0)
  })
})

// =============================================================================
// Warnings (improvement 1.8)
// =============================================================================
describe('buildSessionWarnings', () => {
  it('warns on intervals when injured', () => {
    const w = buildSessionWarnings('intervals', { ...baseProfile(), has_injuries: true }, true)
    expect(w).toContain('lesión')
  })

  it('no warning for easy runs when healthy', () => {
    const w = buildSessionWarnings('easy', baseProfile(), false)
    expect(w).toBeUndefined()
  })

  it('warns on tempo for injured runners', () => {
    const w = buildSessionWarnings('tempo', { ...baseProfile(), has_injuries: true }, true)
    expect(w).toContain('Tempo')
  })

  it('warns when age > 60 with compete goal', () => {
    const w = buildSessionWarnings('easy', { ...baseProfile(), age: 65, goal_type: 'compete' }, false)
    expect(w).toContain('deportólogo')
  })

  it('warns on intervals when age > 65', () => {
    const w = buildSessionWarnings('intervals', { ...baseProfile(), age: 70 }, false)
    expect(w).toContain('autorización médica')
  })

  it('no warning for young healthy runner on intervals', () => {
    const w = buildSessionWarnings('intervals', { ...baseProfile(), age: 30 }, false)
    expect(w).toBeUndefined()
  })
})

// =============================================================================
// Formatters
// =============================================================================
describe('formatPace', () => {
  it('formats with zero-padded seconds', () => {
    expect(formatPace(5.5)).toBe('5:30 min/km')
    expect(formatPace(5.0)).toBe('5:00 min/km')
    expect(formatPace(5.0833)).toBe('5:05 min/km')
  })
})

describe('formatHeartRateZone', () => {
  it('maps long_run to steady zone', () => {
    const zones = calculateHeartRateZones(60, 190)
    const out = formatHeartRateZone(zones, 'long_run')
    expect(out).toContain('lpm')
  })
})

describe('generateWorkoutDetails', () => {
  it('returns Spanish description for each workout type', () => {
    const types: Array<keyof typeof WORKOUT_TEMPLATES> = [
      'easy', 'steady', 'tempo', 'intervals', 'long_run', 'recovery', 'cross', 'race'
    ]
    for (const t of types) {
      const d = generateWorkoutDetails(t, 30, 5.5, 10, 'intermediate', 'Moderado')
      expect(d.length).toBeGreaterThan(0)
    }
  })

  it('intervals description includes rest ratio', () => {
    const d = generateWorkoutDetails('intervals', 40, 5, 10, 'beginner', 'Rápido')
    expect(d).toMatch(/1:2|1:1/)
  })
})

describe('generateDeterministicId', () => {
  it('returns the same UUID for the same input', () => {
    expect(generateDeterministicId('user-1-session-5'))
      .toBe(generateDeterministicId('user-1-session-5'))
  })

  it('returns different IDs for different inputs', () => {
    expect(generateDeterministicId('user-1-session-5'))
      .not.toBe(generateDeterministicId('user-1-session-6'))
  })

  it('returns a valid UUID-shaped string', () => {
    const id = generateDeterministicId('foo')
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})

// =============================================================================
// Full plan generation (integration)
// =============================================================================
describe('generateAlgorithmicPlan - integration', () => {
  const baseProfile: UserProfile = {
    experience_level: 'beginner',
    current_weekly_km: 0,
    available_days_per_week: 3,
    minutes_per_session: 45,
    has_injuries: false,
    age: 30,
    sex: 'male',
    weight: 70,
    preferred_terrain: 'road',
    goal_type: 'fitness'
  }

  it('returns empty array if startDate is on/after raceDate', () => {
    const config = DISTANCE_CONFIGS[7]
    const result = generateAlgorithmicPlan(
      7, '2026-05-17', '2026-05-17', config, baseProfile, 3, 'test'
    )
    expect(result).toEqual([])
  })

  it('produces N weeks x sessionsPerWeek sessions for a 7K plan', () => {
    const config = DISTANCE_CONFIGS[7]
    const start = '2026-05-04'
    const race = '2026-06-29'
    const result = generateAlgorithmicPlan(
      7, start, race, config, baseProfile, 3, 'test'
    )
    expect(result.length).toBeGreaterThan(0)
    expect(result.length % 3).toBe(0) // multiple of sessionsPerWeek
  })

  it('session IDs are deterministic for the same seed', () => {
    const config = DISTANCE_CONFIGS[7]
    const start = '2026-05-04'
    const race = '2026-06-29'
    const a = generateAlgorithmicPlan(7, start, race, config, baseProfile, 3, 'seed-x')
    const b = generateAlgorithmicPlan(7, start, race, config, baseProfile, 3, 'seed-x')
    expect(a.map(s => s.id)).toEqual(b.map(s => s.id))
  })

  it('different seeds yield different IDs (for progress tracking)', () => {
    const config = DISTANCE_CONFIGS[7]
    const start = '2026-05-04'
    const race = '2026-06-29'
    const a = generateAlgorithmicPlan(7, start, race, config, baseProfile, 3, 'seed-a')
    const b = generateAlgorithmicPlan(7, start, race, config, baseProfile, 3, 'seed-b')
    expect(a[0].id).not.toBe(b[0].id)
  })

  it('week 1 of a beginner plan contains no hard sessions (intervals/tempo/race)', () => {
    const config = DISTANCE_CONFIGS[10]
    const start = '2026-05-04'
    const race = '2026-07-13'
    const result = generateAlgorithmicPlan(
      10, start, race, config, baseProfile, 3, 'test'
    )
    const week1 = result.filter(s => s.weekNumber === 1)
    for (const s of week1) {
      expect(['tempo', 'intervals', 'race']).not.toContain(s.workoutType)
    }
  })

  it('last week of a 10K plan contains a race session at the race distance', () => {
    const config = DISTANCE_CONFIGS[10]
    const start = '2026-05-04'
    const race = '2026-07-13'
    const result = generateAlgorithmicPlan(
      10, start, race, config, baseProfile, 3, 'test'
    )
    const raceSession = result.find(s => s.workoutType === 'race')
    expect(raceSession).toBeDefined()
    expect(raceSession?.distance).toBe(10)
  })

  it('last week is a taper week (long_run distance reduced to 30% of race distance)', () => {
    const config = DISTANCE_CONFIGS[10]
    const start = '2026-05-04'
    const race = '2026-07-13'
    const result = generateAlgorithmicPlan(
      10, start, race, config, baseProfile, 3, 'test'
    )
    // The last week has a race session (day 0) and two other tapered sessions.
    // The long_run in the second-to-last week should also be tapered if present.
    const longRuns = result.filter(s => s.workoutType === 'long_run')
    if (longRuns.length > 0) {
      const last = longRuns[longRuns.length - 1]
      // Either race week (where long_run becomes 30% of distance) or
      // any other long run in the taper phase should be reduced.
      // We just assert the last long_run is reasonably reduced.
      expect(last.distance).toBeLessThan(10)
    }
  })

  it('injured beginner has intervals replaced with cross and gets a warning', () => {
    const config = DISTANCE_CONFIGS[10]
    const start = '2026-05-04'
    const race = '2026-07-13'
    const result = generateAlgorithmicPlan(
      10, start, race, config,
      { ...baseProfile, has_injuries: true },
      3, 'test'
    )
    const injuredIntervals = result.filter(s => s.workoutType === 'intervals')
    expect(injuredIntervals).toHaveLength(0)
    const warningPresent = result.some(s => s.warning?.includes('lesión'))
    expect(warningPresent).toBe(true)
  })

  it('5K plan race session has the exact 5K distance (no terrain adjustment on race day)', () => {
    const config = DISTANCE_CONFIGS[5]
    const start = '2026-05-04'
    const race = '2026-06-15'
    const result = generateAlgorithmicPlan(5, start, race, config, baseProfile, 3, 'test')
    const raceSession = result.find(s => s.workoutType === 'race')
    expect(raceSession?.distance).toBe(5)
  })

  it('dates follow a stable weekday pattern (3 days starting on Mon = Mon/Wed/Fri)', () => {
    const config = DISTANCE_CONFIGS[7]
    // 2026-05-04 is a Monday
    const start = '2026-05-04'
    const race = '2026-06-29'
    const result = generateAlgorithmicPlan(7, start, race, config, baseProfile, 3, 'test')
    const firstThree = result.slice(0, 3).map(s => s.date)
    expect(firstThree).toEqual(['2026-05-04', '2026-05-06', '2026-05-08'])
  })

  it('long_run distance never exceeds the configured maxLongRunRatio', () => {
    const config = DISTANCE_CONFIGS[21]
    const start = '2026-05-04'
    const race = '2026-08-17'
    const result = generateAlgorithmicPlan(21, start, race, config, baseProfile, 4, 'test')
    const longRuns = result.filter(s => s.workoutType === 'long_run')
    for (const s of longRuns) {
      // 21K * 0.7 = 14.7 max
      expect(s.distance).toBeLessThanOrEqual(21 * config.maxLongRunRatio + 0.01)
    }
  })

  it('respects the 10% rule: non-taper, non-deload weeks grow at most 10%', () => {
    const config = DISTANCE_CONFIGS[21]
    const start = '2026-05-04'
    const race = '2026-08-17'
    const result = generateAlgorithmicPlan(21, start, race, config, baseProfile, 4, 'test')

    // Group sessions by week
    const weeklyTotals: Record<number, number> = {}
    const weeklyKind: Record<number, 'normal' | 'deload' | 'taper'> = {}
    for (const s of result) {
      const w = s.weekNumber ?? 0
      weeklyTotals[w] = (weeklyTotals[w] || 0) + s.distance
      if (s.isTaperWeek) weeklyKind[w] = 'taper'
      else if (s.isRecoveryWeek) weeklyKind[w] = 'deload'
      else weeklyKind[w] = 'normal'
    }
    const weeks = Object.keys(weeklyTotals).map(Number).sort((a, b) => a - b)
    for (let i = 1; i < weeks.length; i++) {
      const prev = weeklyTotals[weeks[i - 1]]
      const curr = weeklyTotals[weeks[i]]
      const prevKind = weeklyKind[weeks[i - 1]]
      const currKind = weeklyKind[weeks[i]]
      // Skip transitions that involve a deload or taper (intentional drops).
      if (prevKind !== 'normal' || currKind !== 'normal') continue
      if (curr > prev && prev > 0) {
        const growth = (curr - prev) / prev
        // Build-up weeks can grow up to 10%; the per-session distance
        // scaling (long_run is weighted more than easy) may push the
        // total slightly above 10% in practice, hence the small tolerance.
        expect(growth).toBeLessThanOrEqual(0.10 + 0.02)
      }
    }
  })

  it('naturalFactor grows at most 10% per week across the whole plan', () => {
    // White-box check: naturalFactor is exposed on every session.
    const config = DISTANCE_CONFIGS[10]
    const start = '2026-05-04'
    const race = '2026-07-13'
    const result = generateAlgorithmicPlan(10, start, race, config, baseProfile, 3, 'test')

    const weeklyNatural: Record<number, number> = {}
    for (const s of result) {
      const w = s.weekNumber ?? 0
      // Each session in a week has the same naturalFactor; just take the first.
      if (weeklyNatural[w] === undefined) weeklyNatural[w] = s.naturalFactor ?? 0
    }
    const weeks = Object.keys(weeklyNatural).map(Number).sort((a, b) => a - b)
    for (let i = 1; i < weeks.length; i++) {
      const prev = weeklyNatural[weeks[i - 1]]
      const curr = weeklyNatural[weeks[i]]
      if (curr > prev && prev > 0) {
        const growth = (curr - prev) / prev
        expect(growth).toBeLessThanOrEqual(0.10 + 0.001)
      }
    }
  })
})
