import { describe, expect, it } from 'vitest';
import type { Profile } from '@/types/profile';
import { calculateAge, formatAddress, formatFullName, getBirthYear } from '@/utils/profile';

const baseProfile: Profile = {
  source: 'random',
  externalId: 'x',
  title: 'Mr',
  firstName: 'John',
  lastName: 'Smith',
  gender: 'male',
  email: 'john@example.com',
  phone: '011-962-7516',
  dateOfBirth: '1990-06-15T00:00:00.000Z',
  country: 'United States',
  state: 'Michigan',
  city: 'Billings',
  streetName: 'Valwood Pkwy',
  streetNumber: '8929',
  pictureUrl: 'https://example.com/large.jpg',
  thumbnailUrl: 'https://example.com/thumb.jpg',
};

describe('formatFullName', () => {
  it('renders title, first and last', () => {
    expect(formatFullName(baseProfile)).toBe('Mr John Smith');
  });

  it('skips a missing title without leaving a leading space', () => {
    expect(formatFullName({ ...baseProfile, title: '' })).toBe('John Smith');
  });
});

describe('calculateAge', () => {
  it('counts a birthday that has already passed this year', () => {
    expect(calculateAge('1990-06-15T00:00:00.000Z', new Date('2026-09-02T00:00:00Z'))).toBe(36);
  });

  it('does not count a birthday still ahead this year', () => {
    expect(calculateAge('1990-12-15T00:00:00.000Z', new Date('2026-09-02T00:00:00Z'))).toBe(35);
  });

  it('handles the birthday itself', () => {
    expect(calculateAge('1990-09-02T00:00:00.000Z', new Date('2026-09-02T00:00:00Z'))).toBe(36);
  });

  it('returns null for an unparseable date rather than NaN', () => {
    expect(calculateAge('not-a-date')).toBeNull();
  });
});

describe('getBirthYear', () => {
  it('reads the year in UTC so it does not shift with the viewer timezone', () => {
    expect(getBirthYear('1990-01-01T00:00:00.000Z')).toBe(1990);
  });
});

describe('formatAddress', () => {
  it('joins street number, street, city and state', () => {
    expect(formatAddress(baseProfile)).toBe('8929 Valwood Pkwy, Billings, Michigan');
  });

  it('omits missing pieces without leaving dangling commas or "undefined"', () => {
    const sparse = { ...baseProfile, state: undefined, streetNumber: undefined };
    expect(formatAddress(sparse)).toBe('Valwood Pkwy, Billings');
  });

  it('returns an empty string when nothing is known', () => {
    const empty = {
      ...baseProfile,
      state: undefined,
      city: undefined,
      streetName: undefined,
      streetNumber: undefined,
    };
    expect(formatAddress(empty)).toBe('');
  });
});
