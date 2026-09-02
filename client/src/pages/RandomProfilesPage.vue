<script setup lang="ts">
import { toRef } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import ProfileFilters from '@/components/ProfileFilters.vue';
import ProfileList from '@/components/ProfileList.vue';
import ProfileSkeleton from '@/components/ProfileSkeleton.vue';
import { useProfileFilters } from '@/composables/useProfileFilters';
import { useQueryParam } from '@/composables/useQueryParam';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';
import type { Profile } from '@/types/profile';

const router = useRouter();
const store = useRandomProfilesStore();

const { nameQuery, countryQuery, filteredProfiles } = useProfileFilters(
  toRef(store, 'profiles'),
  useQueryParam('name'),
  useQueryParam('country'),
);

/**
 * A profile saved in this session is already in the database, so its row opens
 * the saved copy. Sending it to the random route would offer Save on a record
 * that exists, and would write a rename into the store alone while the
 * database quietly kept the old name.
 */
function openProfile(profile: Profile): void {
  const savedId = store.savedIdFor(profile.externalId);

  void router.push(
    savedId
      ? { name: 'saved-detail', params: { id: savedId } }
      : { name: 'random-detail', params: { externalId: profile.externalId } },
  );
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>Random profiles</h1>

      <!--
        A screen that can fetch when it is empty should be able to fetch when
        it is full. Hidden while empty, because the empty state carries its own
        button and two identical actions on one screen help nobody.
      -->
      <button
        v-if="store.hasBatch"
        type="button"
        :disabled="store.isLoading"
        @click="store.fetchBatch()"
      >
        {{ store.isLoading ? 'Fetching…' : 'Fetch new batch' }}
      </button>
    </div>

    <ProfileSkeleton v-if="store.isLoading" />

    <ErrorState v-else-if="store.error" :message="store.error" @retry="store.fetchBatch" />

    <!-- This page owns the batch, so its Fetch button fetches here rather
         than sending the user back to Home to press a different button. -->
    <EmptyState
      v-else-if="!store.hasBatch"
      message="No batch loaded. Fetch ten random people to get started."
      :action-label="store.isLoading ? 'Fetching…' : 'Fetch'"
      @action="store.fetchBatch()"
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
.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.no-match {
  padding: var(--space-5);
  text-align: center;
}
</style>
