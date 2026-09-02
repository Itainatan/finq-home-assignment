import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchRandomProfiles } from '@/api/random-users.api';
import type { Profile } from '@/types/profile';

/**
 * The current batch of random profiles.
 *
 * This is client state, not server state: it is fetched once, edited locally,
 * and never written back to its origin. Keeping it here rather than in the
 * TanStack Query cache means a stray refetch can never silently discard the
 * user's edits, and it keeps the query cache to things the server owns.
 *
 * The batch deliberately does not survive a full page reload.
 */
export const useRandomProfilesStore = defineStore('randomProfiles', () => {
  const profiles = ref<Profile[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /** External ids saved during this session, so the list can mark them. */
  const savedExternalIds = ref<Set<string>>(new Set());

  const hasBatch = computed(() => profiles.value.length > 0);

  async function fetchBatch(): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      profiles.value = await fetchRandomProfiles(10);
      return true;
    } catch (caught) {
      error.value =
        caught instanceof Error ? caught.message : 'Something went wrong. Please try again.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function findByExternalId(externalId: string): Profile | undefined {
    return profiles.value.find((profile) => profile.externalId === externalId);
  }

  /** Update of an unsaved profile is client-only, per the spec. */
  function renameProfile(externalId: string, firstName: string, lastName: string): void {
    const target = findByExternalId(externalId);
    if (target) {
      target.firstName = firstName;
      target.lastName = lastName;
    }
  }

  function markAsSaved(externalId: string): void {
    savedExternalIds.value = new Set(savedExternalIds.value).add(externalId);
  }

  function isSaved(externalId: string): boolean {
    return savedExternalIds.value.has(externalId);
  }

  return {
    profiles,
    isLoading,
    error,
    hasBatch,
    fetchBatch,
    findByExternalId,
    renameProfile,
    markAsSaved,
    isSaved,
  };
});
