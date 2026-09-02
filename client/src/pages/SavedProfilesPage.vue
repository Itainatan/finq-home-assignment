<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import ProfileFilters from '@/components/ProfileFilters.vue';
import ProfileList from '@/components/ProfileList.vue';
import ProfileSkeleton from '@/components/ProfileSkeleton.vue';
import { useProfileFilters } from '@/composables/useProfileFilters';
import { useSavedProfilesQuery } from '@/composables/useSavedProfiles';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';
import type { Profile } from '@/types/profile';

const router = useRouter();
const randomStore = useRandomProfilesStore();
const { data, isPending, isError, refetch } = useSavedProfilesQuery();

const profiles = computed<Profile[]>(() => data.value ?? []);
const { nameQuery, countryQuery, filteredProfiles } = useProfileFilters(profiles);

function openProfile(profile: Profile): void {
  void router.push({ name: 'saved-detail', params: { id: profile.id } });
}

/**
 * The request starts here but the user moves on immediately: the random list
 * owns both the skeleton and the failure state for this batch, so it is the
 * honest place to wait. `fetchBatch` flips `isLoading` synchronously, so that
 * page renders its skeleton on arrival rather than flashing empty.
 */
function fetchRandomProfiles(): void {
  void randomStore.fetchBatch();
  void router.push({ name: 'random-list' });
}
</script>

<template>
  <div class="page">
    <h1>Saved profiles</h1>

    <ProfileSkeleton v-if="isPending" />

    <!--
      A page that cannot render without this data gets an inline error with a
      retry, not a toast that leaves an empty screen behind.
    -->
    <ErrorState
      v-else-if="isError"
      message="Could not load your saved profiles."
      @retry="refetch()"
    />

    <EmptyState
      v-else-if="profiles.length === 0"
      message="No saved profiles yet."
      action-label="Fetch random profiles"
      @action="fetchRandomProfiles"
    />

    <template v-else>
      <ProfileFilters v-model:name-query="nameQuery" v-model:country-query="countryQuery" />

      <p v-if="filteredProfiles.length === 0" class="muted no-match">
        No profiles match your filters.
      </p>

      <ProfileList v-else :profiles="filteredProfiles" @select="openProfile" />
    </template>
  </div>
</template>

<style scoped>
.no-match {
  padding: var(--space-5);
  text-align: center;
}
</style>
