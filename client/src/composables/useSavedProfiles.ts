import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import {
  deleteProfile,
  listSavedProfiles,
  saveProfile,
  updateProfileName,
} from '@/api/profiles.api';
import type { Ref } from 'vue';
import type { EditableName, Profile } from '@/types/profile';

export const SAVED_PROFILES_KEY = ['savedProfiles'] as const;

/** Server-owned state, so this one genuinely belongs in the query cache. */
export function useSavedProfilesQuery(enabled?: Ref<boolean>) {
  return useQuery({
    queryKey: SAVED_PROFILES_KEY,
    queryFn: listSavedProfiles,
    enabled,
  });
}

/**
 * Creation is deliberately NOT optimistic: it can conflict on externalId and
 * the database is the only source of the new id, which the caller needs in
 * order to navigate to the saved route.
 */
export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Profile) => saveProfile(profile),
    onSuccess: (saved) => {
      queryClient.setQueryData<Profile[]>(SAVED_PROFILES_KEY, (previous) =>
        previous ? [saved, ...previous] : [saved],
      );
    },
  });
}

/** Optimistic: a rename is a small, reversible change with no server-side identity. */
export function useUpdateProfileName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: EditableName }) =>
      updateProfileName(id, name),

    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: SAVED_PROFILES_KEY });
      const previous = queryClient.getQueryData<Profile[]>(SAVED_PROFILES_KEY);

      queryClient.setQueryData<Profile[]>(SAVED_PROFILES_KEY, (current) =>
        (current ?? []).map((profile) =>
          profile.id === id ? { ...profile, ...name } : profile,
        ),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SAVED_PROFILES_KEY, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SAVED_PROFILES_KEY });
    },
  });
}

/** Optimistic, with the same rollback contract as update. */
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SAVED_PROFILES_KEY });
      const previous = queryClient.getQueryData<Profile[]>(SAVED_PROFILES_KEY);

      queryClient.setQueryData<Profile[]>(SAVED_PROFILES_KEY, (current) =>
        (current ?? []).filter((profile) => profile.id !== id),
      );

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SAVED_PROFILES_KEY, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SAVED_PROFILES_KEY });
    },
  });
}
