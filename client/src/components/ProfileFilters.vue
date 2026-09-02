<script setup lang="ts">
const nameQuery = defineModel<string>('nameQuery', { required: true });
const countryQuery = defineModel<string>('countryQuery', { required: true });
</script>

<template>
  <div class="filters card">
    <div class="field">
      <label for="filter-name">Filter by name</label>
      <input id="filter-name" v-model="nameQuery" type="search" placeholder="e.g. Smith" />
    </div>
    <div class="field">
      <label for="filter-country">Filter by country</label>
      <input
        id="filter-country"
        v-model="countryQuery"
        type="search"
        placeholder="e.g. Germany"
      />
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

@media (max-width: 560px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
