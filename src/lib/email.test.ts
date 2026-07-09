import { describe, it, expect } from 'vitest'
import { assembleEmail } from './email'
import { readFileSync } from 'node:fs'

describe('email', () => {
  it('assembles the real address', () => {
    expect(assembleEmail()).toBe('maximilian.g.lombardo@gmail.com')
  })
  it('has no contiguous literal in its own source', () => {
    const src = readFileSync(new URL('./email.ts', import.meta.url), 'utf8')
    expect(src.includes('maximilian.g.lombardo@gmail.com')).toBe(false)
  })
})
