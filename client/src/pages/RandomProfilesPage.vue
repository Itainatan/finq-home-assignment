<script setup lang="ts">
import { toRef } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import ProfileFilters from '@/components/ProfileFilters.vue';
import ProfileList from '@/components/ProfileList.vue';
import ProfileSkeleton from '@/components/ProfileSkeleton.vue';
import { useProfileFilters } from '@/composables/useProfileFilters';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';
import type { Profile } from '@/types/profile';

const router = useRouter();
const store = useRandomProfilesStore();

const { nameQuery, countryQuery, filteredProfiles } = useProfileFilters(
  toRef(store, 'profiles'),
);

function openProfile(profile: Profile): void {
  void router.push({ name: 'random-detail', params: { externalId: profile.externalId } });
}
</script>

<template>
  <div class="page">
    <h1>Random profiles</h1>

    <ProfileSkeleton v-if="store.isLoading" />

    <ErrorState v-else-if="store.error" :message="store.error" @retry="store.fetchBatch" />

    <EmptyState
      v-else-if="!store.hasBatch"
      message="No batch loaded. Fetch ten random people to get started."
      action-label="Fetch"
      @action="router.push({ name: 'home' })"
    />

    <template v-else>
      <ProfileFilters v-model:name-query="nameQuery" v-model:country-query="countryQuery" />

      <!-- An empty filter result is a search outcome, not an error. -->
      <p v-if="filteredProfiles.length === 0" class="muted no-match">
        No profiles match your filters.
      </p>

      <ProfileList
        v-else
        :profiles="filteredProfiles"
        :saved-external-ids="store.isSaved"
        @select="openProfile"
      />
    </template>
  </div>
</template>

<style scoped>
.no-match {
  padding: var(--space-5);
  text-align: center;
}
</style>
