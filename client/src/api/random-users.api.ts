import { normalizeRandomUser, type RandomUserResponse } from '@/mappers/randomUser.mapper';
import type { Profile } from '@/types/profile';

/**
 * The version is pinned. `https://randomuser.me/api/` always serves the newest
 * version, so an upstream release could reshape the response without warning.
 */
const RANDOM_USER_URL = 'https://randomuser.me/api/1.4/';

/** Only the fields the app renders. `login` is required for the uuid. */
const INCLUDED_FIELDS = 'gender,name,location,email,login,dob,phone,picture';

export async function fetchRandomProfiles(count = 10): Promise<Profile[]> {
  const url = `${RANDOM_USER_URL}?results=${count}&inc=${INCLUDED_FIELDS}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Could not reach the random user service. Please try again.');
  }

  if (!response.ok) {
    throw new Error('The random user service returned an error. Please try again.');
  }

  const payload = (await response.json()) as RandomUserResponse;
  return payload.results.map(normalizeRandomUser);
}
