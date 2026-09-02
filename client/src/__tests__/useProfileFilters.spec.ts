import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useProfileFilters } from '@/composables/useProfileFilters';
import type { Profile } from '@/types/profile';

function makeProfile(overrides: Partial<Profile>): Profile {
  return {
    source: 'random',
    externalId: Math.random().toString(36).slice(2),
    title: 'Mr',
    firstName: 'John',
    lastName: 'Smith',
    gender: 'male',
    email: 'john@example.com',
    phone: '000',
    dateOfBirth: '1990-01-01T00:00:00.000Z',
    country: 'United States',
    pictureUrl: 'https://example.com/l.jpg',
    thumbnailUrl: 'https://example.com/t.jpg',
    ...overrides,
  };
}

const profiles = ref<Profile[]>([
  makeProfile({ firstName: 'John', lastName: 'Smith', country: 'United States' }),
  makeProfile({ firstName: 'Ana', lastName: 'Silva', country: 'Brazil' }),
  makeProfile({ firstName: 'Lena', lastName: 'Schmidt', country: 'Germany' }),
]);

describe('useProfileFilters', () => {
  it('returns everything when both inputs are empty', () => {
    const { filteredProfiles } = useProfileFilters(profiles);
    expect(filteredProfiles.value).toHaveLength(3);
  });

  it('matches on the full name, case insensitively', () => {
    const { nameQuery, filteredProfiles } = useProfileFilters(profiles);
    nameQuery.value = 's';
    expect(filteredProfiles.value).toHaveLength(3);

    nameQuery.value = 'SCHMIDT';
    expect(filteredProfiles.value.map((p) => p.lastName)).toEqual(['Schmidt']);
  });

  it('ignores surrounding whitespace', () => {
    const { nameQuery, filteredProfiles } = useProfileFilters(profiles);
    nameQuery.value = '   silva  ';
    expect(filteredProfiles.value).toHaveLength(1);
  });

  it('matches a country substring', () => {
    const { countryQuery, filteredProfiles } = useProfileFilters(profiles);
    countryQuery.value = 'brazil';
    expect(filteredProfiles.value.map((p) => p.firstName)).toEqual(['Ana']);
  });

  it('applies both filters together', () => {
    const { nameQuery, countryQuery, filteredProfiles } = useProfileFilters(profiles);
    nameQuery.value = 'ana';
    countryQuery.value = 'germany';
    expect(filteredProfiles.value).toHaveLength(0);
  });
});
