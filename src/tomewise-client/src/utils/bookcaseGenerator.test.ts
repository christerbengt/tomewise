import { describe, it, expect } from 'vitest';
import { generateBookcaseSequence } from './bookcaseGenerator';

describe('generateBookcaseSequence', () => {
  it('generates single letter sequence', () => {
    expect(generateBookcaseSequence('A', 'C')).toEqual(['A', 'B', 'C']);
  });

  it('generates sequence ending at Z', () => {
    const result = generateBookcaseSequence('A', 'Z');
    expect(result).toHaveLength(26);
    expect(result[0]).toBe('A');
    expect(result[25]).toBe('Z');
  });

  it('generates double letter sequence after Z', () => {
    const result = generateBookcaseSequence('Y', 'AB');
    expect(result).toEqual(['Y', 'Z', 'AA', 'AB']);
  });

  it('returns empty array when from is after to', () => {
    expect(generateBookcaseSequence('C', 'A')).toEqual([]);
  });

  it('returns empty array when range exceeds 500', () => {
    expect(generateBookcaseSequence('A', 'ZZZ')).toEqual([]);
  });

  it('handles case insensitivity', () => {
    expect(generateBookcaseSequence('a', 'c')).toEqual(['A', 'B', 'C']);
  });
});