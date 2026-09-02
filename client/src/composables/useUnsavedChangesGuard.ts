import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const DISCARD_MESSAGE = 'You have unsaved changes. Leave without saving?';

/**
 * Guards both exits: in-app navigation through the router, and refresh or tab
 * close through the browser's own prompt.
 */
export function useUnsavedChangesGuard(isDirty: Ref<boolean>): void {
  function handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!isDirty.value) return;
    event.preventDefault();
    // Required by some browsers for the native prompt to appear.
    event.returnValue = '';
  }

  onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload));
  onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload));

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true;
    return window.confirm(DISCARD_MESSAGE);
  });
}
