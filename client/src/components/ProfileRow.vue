<script setup lang="ts">
import { computed } from 'vue';
import { formatFullName } from '@/utils/profile';
import type { Profile } from '@/types/profile';

const props = defineProps<{ profile: Profile; saved?: boolean }>();
defineEmits<{ select: [profile: Profile] }>();

const fullName = computed(() => formatFullName(props.profile));
</script>

<template>
  <li class="row card">
    <!--
      A real button carries the row interaction so keyboard users get activation
      and focus for free, rather than a div with a click handler.
    -->
    <button type="button" class="hit-area" @click="$emit('select', profile)">
      <img class="thumb" :src="profile.thumbnailUrl" :alt="`Portrait of ${fullName}`" />

      <span class="details">
        <span class="name">
          {{ fullName }}
          <span v-if="saved" class="badge">Saved</span>
        </span>
        <span class="meta muted">{{ profile.gender }} &middot; {{ profile.country }}</span>
        <span class="contact muted">{{ profile.email }}</span>
        <span class="contact muted">{{ profile.phone }}</span>
      </span>
    </button>
  </li>
</template>

<style scoped>
.row {
  overflow: hidden;
}

.hit-area {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  text-align: left;
  background: transparent;
  border: none;
  border-radius: var(--radius);
}

.hit-area:hover {
  background: #f2f5fa;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.details {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.name {
  font-weight: 600;
}

.badge {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 1px 6px;
  margin-left: var(--space-2);
  border-radius: 999px;
  background: #e7eefb;
  color: var(--color-accent);
}

.meta,
.contact {
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
</style>
