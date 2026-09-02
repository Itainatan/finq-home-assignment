<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header class="topbar">
    <div class="inner">
      <RouterLink to="/" class="brand">Profile Explorer</RouterLink>
      <nav>
        <RouterLink to="/random">Random</RouterLink>
        <RouterLink to="/saved">History</RouterLink>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.inner {
  max-width: 880px;
  margin: 0 auto;
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.brand {
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

nav {
  display: flex;
  gap: var(--space-4);
}

nav a {
  color: var(--color-muted);
  text-decoration: none;
}

nav a:hover,
nav a.router-link-active {
  color: var(--color-accent);
}
</style>
