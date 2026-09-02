<script setup lang="ts">
defineProps<{ message: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="error-state card" role="alert">
    <p class="message">{{ message }}</p>
    <button type="button" class="primary" @click="$emit('retry')">Retry</button>
  </div>
</template>

<style scoped>
.error-state {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  border-color: var(--color-danger);
}

.message {
  margin: 0;
  color: var(--color-danger);
}
</style>
