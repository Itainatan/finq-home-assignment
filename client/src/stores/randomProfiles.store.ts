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

  /**
   * Profiles saved during this session, keyed by external id and holding the
   * id the database assigned. The list needs the flag to mark a row and the id
   * to send that row to its saved copy instead of the random one.
   */
  const savedIdByExternalId = ref<Map<string, string>>(new Map());

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

  function markAsSaved(externalId: string, id: string): void {
    savedIdByExternalId.value = new Map(savedIdByExternalId.value).set(externalId, id);
  }

  /** A deleted profile must stop pointing the random list at a dead id. */
  function markAsUnsaved(externalId: string): void {
    const next = new Map(savedIdByExternalId.value);
    next.delete(externalId);
    savedIdByExternalId.value = next;
  }

  function isSaved(externalId: string): boolean {
    return savedIdByExternalId.value.has(externalId);
  }

  function savedIdFor(externalId: string): string | undefined {
    return savedIdByExternalId.value.get(externalId);
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
    markAsUnsaved,
    isSaved,
    savedIdFor,
  };
});
