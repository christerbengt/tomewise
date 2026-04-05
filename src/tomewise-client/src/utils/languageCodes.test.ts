import { describe, it, expect } from 'vitest';
import { getLanguageName } from './languageCodes';

describe('getLanguageName', () => {
  it('returns Swedish for swe', () => {
    expect(getLanguageName('swe')).toBe('Swedish');
  });

  it('returns English for eng', () => {
    expect(getLanguageName('eng')).toBe('English');
  });

  it('returns Norwegian for nor', () => {
    expect(getLanguageName('nor')).toBe('Norwegian');
  });

  it('returns the code itself for unknown codes', () => {
    expect(getLanguageName('xyz')).toBe('xyz');
  });

  it('returns null for null input', () => {
    expect(getLanguageName(null)).toBeNull();
  });

  it('handles lowercase codes', () => {
    expect(getLanguageName('SWE')).toBe('Swedish');
  });
});