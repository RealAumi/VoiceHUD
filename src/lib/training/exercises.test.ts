import { describe, it, expect } from 'vitest'
import {
  exercises,
  getExercisesByCategory,
  getExercisesByDifficulty,
  type Exercise,
} from './exercises'

describe('exercises data', () => {
  it('has at least 5 exercises', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(5)
  })

  it('each exercise has a unique id', () => {
    const ids = exercises.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each exercise has valid category', () => {
    const validCategories = ['pitch', 'resonance', 'breathing', 'articulation', 'intonation']
    for (const exercise of exercises) {
      expect(validCategories).toContain(exercise.category)
    }
  })

  it('each exercise has valid difficulty', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    for (const exercise of exercises) {
      expect(validDifficulties).toContain(exercise.difficulty)
    }
  })

  it('each exercise has positive duration', () => {
    for (const exercise of exercises) {
      expect(exercise.durationMinutes).toBeGreaterThan(0)
    }
  })

  it('each exercise has bilingual name and description', () => {
    for (const exercise of exercises) {
      expect(exercise.name.zh).toBeTruthy()
      expect(exercise.name.en).toBeTruthy()
      expect(exercise.description.zh).toBeTruthy()
      expect(exercise.description.en).toBeTruthy()
    }
  })

  it('each exercise has non-empty steps in both languages', () => {
    for (const exercise of exercises) {
      expect(exercise.steps.zh.length).toBeGreaterThan(0)
      expect(exercise.steps.en.length).toBeGreaterThan(0)
      // Both languages should have the same number of steps
      expect(exercise.steps.zh.length).toBe(exercise.steps.en.length)
    }
  })

  it('each exercise has non-empty tips in both languages', () => {
    for (const exercise of exercises) {
      expect(exercise.tips.zh.length).toBeGreaterThan(0)
      expect(exercise.tips.en.length).toBeGreaterThan(0)
      expect(exercise.tips.zh.length).toBe(exercise.tips.en.length)
    }
  })
})

describe('getExercisesByCategory', () => {
  it('returns only exercises of the specified category', () => {
    const breathing = getExercisesByCategory('breathing')
    expect(breathing.length).toBeGreaterThan(0)
    for (const exercise of breathing) {
      expect(exercise.category).toBe('breathing')
    }
  })

  it('returns exercises for each category', () => {
    const categories: Exercise['category'][] = ['pitch', 'resonance', 'breathing', 'articulation', 'intonation']
    for (const category of categories) {
      const result = getExercisesByCategory(category)
      expect(result.length).toBeGreaterThan(0)
    }
  })

  it('returns empty array for invalid category', () => {
    const result = getExercisesByCategory('invalid' as Exercise['category'])
    expect(result).toEqual([])
  })
})

describe('getExercisesByDifficulty', () => {
  it('returns only exercises of the specified difficulty', () => {
    const beginnerExercises = getExercisesByDifficulty('beginner')
    expect(beginnerExercises.length).toBeGreaterThan(0)
    for (const exercise of beginnerExercises) {
      expect(exercise.difficulty).toBe('beginner')
    }
  })

  it('returns exercises for beginner and intermediate difficulties', () => {
    expect(getExercisesByDifficulty('beginner').length).toBeGreaterThan(0)
    expect(getExercisesByDifficulty('intermediate').length).toBeGreaterThan(0)
  })
})
