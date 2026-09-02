<script setup lang="ts">
defineProps<{ message: string; actionLabel?: string }>();
defineEmits<{ action: [] }>();
</script>

<template>
  <div class="empty-state card">
    <p class="message muted">{{ message }}</p>
    <button v-if="actionLabel" type="button" class="primary" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.message {
  margin: 0;
}
</style>
