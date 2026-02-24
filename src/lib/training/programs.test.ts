import { describe, it, expect } from 'vitest'
import { programs, getProgramById } from './programs'
import { exercises } from './exercises'

describe('programs data', () => {
  it('has at least 3 programs', () => {
    expect(programs.length).toBeGreaterThanOrEqual(3)
  })

  it('each program has a unique id', () => {
    const ids = programs.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each program has bilingual name and description', () => {
    for (const program of programs) {
      expect(program.name.zh).toBeTruthy()
      expect(program.name.en).toBeTruthy()
      expect(program.description.zh).toBeTruthy()
      expect(program.description.en).toBeTruthy()
    }
  })

  it('each program has valid difficulty', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    for (const program of programs) {
      expect(validDifficulties).toContain(program.difficulty)
    }
  })

  it('each program has positive duration and daily minutes', () => {
    for (const program of programs) {
      expect(program.durationWeeks).toBeGreaterThan(0)
      expect(program.dailyMinutes).toBeGreaterThan(0)
    }
  })

  it('each program has a non-empty schedule', () => {
    for (const program of programs) {
      expect(program.schedule.length).toBeGreaterThan(0)
    }
  })

  it('schedule references valid exercise IDs', () => {
    const validExerciseIds = new Set(exercises.map((e) => e.id))
    for (const program of programs) {
      for (const day of program.schedule) {
        for (const exerciseId of day.exerciseIds) {
          expect(validExerciseIds.has(exerciseId)).toBe(true)
        }
      }
    }
  })

  it('schedule days have bilingual focus descriptions', () => {
    for (const program of programs) {
      for (const day of program.schedule) {
        expect(day.focus.zh).toBeTruthy()
        expect(day.focus.en).toBeTruthy()
      }
    }
  })

  it('schedule days have positive day numbers', () => {
    for (const program of programs) {
      for (const day of program.schedule) {
        expect(day.day).toBeGreaterThan(0)
      }
    }
  })
})

describe('getProgramById', () => {
  it('returns the correct program by id', () => {
    const program = getProgramById('chen-zhen-beginner')
    expect(program).toBeDefined()
    expect(program!.id).toBe('chen-zhen-beginner')
  })

  it('returns undefined for unknown id', () => {
    expect(getProgramById('nonexistent')).toBeUndefined()
  })

  it('returns each known program', () => {
    for (const program of programs) {
      const result = getProgramById(program.id)
      expect(result).toBeDefined()
      expect(result!.id).toBe(program.id)
    }
  })
})
