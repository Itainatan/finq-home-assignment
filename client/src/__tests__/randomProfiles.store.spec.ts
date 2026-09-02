import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';

/*
 * The random list uses this to decide where a row leads. A row whose profile is
 * already in the database must open the saved copy: opening the random one
 * offered Save on an existing record and wrote renames to memory alone, leaving
 * the database on the old name with nothing to tell the user.
 */
describe('randomProfiles store: saved tracking', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('treats an unknown profile as unsaved', () => {
    const store = useRandomProfilesStore();

    expect(store.isSaved('ext-1')).toBe(false);
    expect(store.savedIdFor('ext-1')).toBeUndefined();
  });

  it('remembers the database id a saved profile was given', () => {
    const store = useRandomProfilesStore();

    store.markAsSaved('ext-1', 'db-1');

    expect(store.isSaved('ext-1')).toBe(true);
    expect(store.savedIdFor('ext-1')).toBe('db-1');
  });

  it('forgets the id once the profile is deleted', () => {
    const store = useRandomProfilesStore();
    store.markAsSaved('ext-1', 'db-1');
    store.markAsSaved('ext-2', 'db-2');

    store.markAsUnsaved('ext-1');

    expect(store.isSaved('ext-1')).toBe(false);
    expect(store.savedIdFor('ext-1')).toBeUndefined();
    expect(store.savedIdFor('ext-2')).toBe('db-2');
  });
});
