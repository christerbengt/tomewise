import { describe, it, expect } from 'vitest';

const parseIsAdmin = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (Array.isArray(roles)) return roles.includes('Admin');
    return roles === 'Admin';
  } catch {
    return false;
  }
};

const makeToken = (payload: object): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe('parseIsAdmin', () => {
  it('returns false for null token', () => {
    expect(parseIsAdmin(null)).toBe(false);
  });

  it('returns false for user without roles', () => {
    const token = makeToken({ sub: '123', email: 'test@test.com' });
    expect(parseIsAdmin(token)).toBe(false);
  });

  it('returns true for admin user', () => {
    const token = makeToken({
      sub: '123',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin'
    });
    expect(parseIsAdmin(token)).toBe(true);
  });

  it('returns true when Admin is in roles array', () => {
    const token = makeToken({
      sub: '123',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': ['Admin', 'User']
    });
    expect(parseIsAdmin(token)).toBe(true);
  });

  it('returns false for non-admin role', () => {
    const token = makeToken({
      sub: '123',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Collector'
    });
    expect(parseIsAdmin(token)).toBe(false);
  });
});