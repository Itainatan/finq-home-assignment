import { computed, ref, type Ref } from 'vue';
import { formatFullName } from '@/utils/profile';
import type { Profile } from '@/types/profile';

/**
 * Filtering is synchronous and immediate, with no debounce: ten already-loaded
 * records are being filtered in memory and no request is issued, so a delay
 * would only make the input feel laggy.
 */
export function useProfileFilters(profiles: Ref<Profile[]>) {
  const nameQuery = ref('');
  const countryQuery = ref('');

  const hasActiveFilter = computed(
    () => nameQuery.value.trim().length > 0 || countryQuery.value.trim().length > 0,
  );

  const filteredProfiles = computed(() => {
    const name = nameQuery.value.trim().toLowerCase();
    const country = countryQuery.value.trim().toLowerCase();

    if (!name && !country) return profiles.value;

    return profiles.value.filter((profile) => {
      const matchesName =
        !name || formatFullName(profile).toLowerCase().includes(name);
      const matchesCountry =
        !country || profile.country.toLowerCase().includes(country);
      return matchesName && matchesCountry;
    });
  });

  function clearFilters(): void {
    nameQuery.value = '';
    countryQuery.value = '';
  }

  return { nameQuery, countryQuery, filteredProfiles, hasActiveFilter, clearFilters };
}
