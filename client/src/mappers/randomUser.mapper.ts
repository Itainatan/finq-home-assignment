import type { Profile } from '@/types/profile';

/** Only the fields we actually consume are typed. */
export interface RandomUserResult {
  gender: string;
  name: { title: string; first: string; last: string };
  location: {
    street: { number: number; name: string };
    city: string;
    state: string;
    country: string;
  };
  email: string;
  login: { uuid: string };
  dob: { date: string; age: number };
  phone: string;
  picture: { large: string; thumbnail: string };
}

export interface RandomUserResponse {
  results: RandomUserResult[];
}

/**
 * The single boundary between the provider's shape and ours.
 *
 * `login.uuid` is used as identity rather than `id.value`: the latter is a
 * nationality-specific document number and is frequently null.
 */
export function normalizeRandomUser(result: RandomUserResult): Profile {
  return {
    source: 'random',
    externalId: result.login.uuid,

    title: result.name.title ?? '',
    firstName: result.name.first,
    lastName: result.name.last,

    gender: result.gender,

    email: result.email,
    phone: result.phone,

    dateOfBirth: result.dob.date,

    country: result.location.country,
    state: result.location.state || undefined,
    city: result.location.city || undefined,

    streetName: result.location.street?.name || undefined,
    // Kept as a string: an address fragment, never arithmetic.
    streetNumber:
      result.location.street?.number != null
        ? String(result.location.street.number)
        : undefined,

    pictureUrl: result.picture.large,
    thumbnailUrl: result.picture.thumbnail,
  };
}
