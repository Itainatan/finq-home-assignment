<script setup lang="ts">
import ProfileRow from '@/components/ProfileRow.vue';
import type { Profile } from '@/types/profile';

defineProps<{ profiles: Profile[]; savedExternalIds?: (externalId: string) => boolean }>();
defineEmits<{ select: [profile: Profile] }>();
</script>

<template>
  <ul class="list">
    <ProfileRow
      v-for="profile in profiles"
      :key="profile.id ?? profile.externalId"
      :profile="profile"
      :saved="savedExternalIds ? savedExternalIds(profile.externalId) : false"
      @select="$emit('select', $event)"
    />
  </ul>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-3);
}
</style>
