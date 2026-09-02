import { describe, expect, it } from 'vitest';
import { normalizeRandomUser, type RandomUserResult } from '@/mappers/randomUser.mapper';

const apiResult: RandomUserResult = {
  gender: 'female',
  name: { title: 'Miss', first: 'Jennie', last: 'Nichols' },
  location: {
    street: { number: 8929, name: 'Valwood Pkwy' },
    city: 'Billings',
    state: 'Michigan',
    country: 'United States',
  },
  email: 'jennie.nichols@example.com',
  login: { uuid: '9b9b1e7a-0000-4000-8000-000000000001' },
  dob: { date: '1992-03-08T15:13:16.688Z', age: 34 },
  phone: '(272) 790-0888',
  picture: {
    large: 'https://randomuser.me/api/portraits/women/1.jpg',
    thumbnail: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
  },
};

describe('normalizeRandomUser', () => {
  it('maps the provider shape onto our own model', () => {
    const profile = normalizeRandomUser(apiResult);

    expect(profile).toMatchObject({
      source: 'random',
      externalId: '9b9b1e7a-0000-4000-8000-000000000001',
      title: 'Miss',
      firstName: 'Jennie',
      lastName: 'Nichols',
      country: 'United States',
      streetName: 'Valwood Pkwy',
    });
  });

  it('keeps the street number as a string', () => {
    expect(normalizeRandomUser(apiResult).streetNumber).toBe('8929');
  });

  it('uses login.uuid as identity, not any nationality specific document id', () => {
    expect(normalizeRandomUser(apiResult).externalId).toBe(apiResult.login.uuid);
  });

  it('turns empty optional location fields into undefined rather than empty strings', () => {
    const withoutState = {
      ...apiResult,
      location: { ...apiResult.location, state: '', city: '' },
    };
    const profile = normalizeRandomUser(withoutState);

    expect(profile.state).toBeUndefined();
    expect(profile.city).toBeUndefined();
  });
});
