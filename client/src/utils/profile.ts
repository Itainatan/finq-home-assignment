import type { Profile } from '@/types/profile';

/** Screen 1 asks for title + first + last, gracefully skipping a missing title. */
export function formatFullName(profile: Pick<Profile, 'title' | 'firstName' | 'lastName'>): string {
  return [profile.title, profile.firstName, profile.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}

export function getBirthYear(isoDate: string): number | null {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear();
}

/**
 * Age is derived at render time so it can never go stale in the database.
 * UTC parts are compared on both sides so the result does not shift with the
 * viewer's timezone.
 */
export function calculateAge(isoDate: string, now: Date = new Date()): number | null {
  const birth = new Date(isoDate);
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age < 0 ? null : age;
}

/**
 * Builds a readable address, dropping missing pieces rather than emitting
 * "undefined" or dangling commas.
 */
export function formatAddress(profile: Profile): string {
  const street = [profile.streetNumber, profile.streetName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return [street, profile.city, profile.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}
