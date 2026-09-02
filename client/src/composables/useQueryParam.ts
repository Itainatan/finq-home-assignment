import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * A string ref kept in step with the URL query, in both directions.
 *
 * The input binds to this ref rather than to `route.query` directly: writing
 * through the router on every keystroke would make each character wait for a
 * navigation to resolve, which is the exact lag the undebounced filter exists
 * to avoid.
 *
 * The URL is updated with `replace`, not `push`. A filter is a view of a page
 * rather than a new place in history, and replacing is what leaves the query
 * on the history entry the user comes back to from a profile — pushing would
 * instead make Back walk backwards one keystroke at a time.
 */
export function useQueryParam(key: string): Ref<string> {
  const route = useRoute();
  const router = useRouter();

  const fromUrl = (): string => {
    const value = route.query[key];
    return typeof value === 'string' ? value : '';
  };

  const state = ref(fromUrl());

  watch(state, (value) => {
    if (value === fromUrl()) return;

    const query = { ...route.query };

    if (value) {
      query[key] = value;
    } else {
      // An empty filter should leave no trace in the URL.
      delete query[key];
    }

    void router.replace({ query });
  });

  /*
   * The other direction matters more than it looks. Navigating to the same
   * route with a different query — the nav bar links to a bare /random — reuses
   * the component instead of remounting it, so `setup` never runs again and the
   * field would keep filtering by a value the URL has already dropped.
   */
  watch(fromUrl, (value) => {
    if (value !== state.value) {
      state.value = value;
    }
  });

  return state;
}
