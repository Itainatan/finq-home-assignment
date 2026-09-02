<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 });
</script>

<template>
  <ul class="skeleton-list" aria-hidden="true">
    <li v-for="row in rows" :key="row" class="skeleton-row card">
      <span class="avatar shimmer" />
      <span class="lines">
        <span class="line shimmer wide" />
        <span class="line shimmer" />
      </span>
    </li>
  </ul>
</template>

<style scoped>
.skeleton-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-3);
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lines {
  display: grid;
  gap: var(--space-2);
  flex: 1;
}

.line {
  height: 12px;
  border-radius: 6px;
  width: 40%;
}

.line.wide {
  width: 65%;
}

.shimmer {
  background: linear-gradient(90deg, #e9ecf1 25%, #f3f5f8 50%, #e9ecf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
  }
}
</style>
