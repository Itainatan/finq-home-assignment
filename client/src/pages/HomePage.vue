<script setup lang="ts">
import { useRouter } from 'vue-router';
import ErrorState from '@/components/ErrorState.vue';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';

const router = useRouter();
const store = useRandomProfilesStore();

/**
 * Every explicit Fetch pulls a fresh batch. Navigation stays on Home when the
 * provider fails, so the user is never dropped onto an empty list screen.
 */
async function fetchProfiles(): Promise<void> {
  const succeeded = await store.fetchBatch();
  if (succeeded) {
    await router.push({ name: 'random-list' });
  }
}
</script>

<template>
  <div class="page">
    <h1>Profile Explorer</h1>
    <p class="muted intro">
      Fetch ten random people, or review the ones you have already saved.
    </p>

    <div class="actions">
      <button type="button" class="primary" :disabled="store.isLoading" @click="fetchProfiles">
        {{ store.isLoading ? 'Fetching…' : 'Fetch' }}
      </button>
      <button type="button" @click="router.push({ name: 'saved-list' })">History</button>
    </div>

    <ErrorState v-if="store.error" :message="store.error" @retry="fetchProfiles" />
  </div>
</template>

<style scoped>
.intro {
  margin-top: 0;
  margin-bottom: var(--space-5);
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
</style>
