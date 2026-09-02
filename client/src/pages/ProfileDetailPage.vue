<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import ErrorState from '@/components/ErrorState.vue';
import ProfileSkeleton from '@/components/ProfileSkeleton.vue';
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard';
import {
  useDeleteProfile,
  useSaveProfile,
  useSavedProfilesQuery,
  useUpdateProfileName,
} from '@/composables/useSavedProfiles';
import { useRandomProfilesStore } from '@/stores/randomProfiles.store';
import type { Profile, ProfileSource } from '@/types/profile';
import { calculateAge, formatAddress, getBirthYear } from '@/utils/profile';

const route = useRoute();
const router = useRouter();
const store = useRandomProfilesStore();

/** One page serves both sources; route metadata decides which. */
const source = computed<ProfileSource>(() => (route.meta.source as ProfileSource) ?? 'random');
const isSavedSource = computed(() => source.value === 'saved');

// The saved collection is only fetched on the saved route.
const savedQuery = useSavedProfilesQuery(isSavedSource);

const saveMutation = useSaveProfile();
const updateMutation = useUpdateProfileName();
const deleteMutation = useDeleteProfile();

const profile = computed<Profile | undefined>(() => {
  if (isSavedSource.value) {
    return (savedQuery.data.value ?? []).find((item) => item.id === String(route.params.id));
  }
  return store.findByExternalId(String(route.params.externalId));
});

/* ---------------------------------------------------------------- form ---- */

const firstName = ref('');
const lastName = ref('');
const showValidation = ref(false);

watch(
  profile,
  (current) => {
    firstName.value = current?.firstName ?? '';
    lastName.value = current?.lastName ?? '';
    showValidation.value = false;
  },
  { immediate: true },
);

const firstNameError = computed(() =>
  firstName.value.trim() ? '' : 'שם פרטי הוא שדה חובה',
);
const lastNameError = computed(() => (lastName.value.trim() ? '' : 'שם משפחה הוא שדה חובה'));
const isValid = computed(() => !firstNameError.value && !lastNameError.value);

/**
 * Dirtiness is measured against the profile itself, so a committed change —
 * whether it landed in the store or in the query cache — clears the flag with
 * no separate bookkeeping.
 */
const isDirty = computed(
  () =>
    !!profile.value &&
    (firstName.value !== profile.value.firstName ||
      lastName.value !== profile.value.lastName),
);

/** Set while navigating away on purpose, so the guard does not fight us. */
const isLeavingDeliberately = ref(false);
const shouldGuard = computed(() => isDirty.value && !isLeavingDeliberately.value);
useUnsavedChangesGuard(shouldGuard);

const isBusy = computed(
  () =>
    saveMutation.isPending.value ||
    updateMutation.isPending.value ||
    deleteMutation.isPending.value,
);

/* ------------------------------------------------------------- actions ---- */

/*
 * Hebrew stops at the edge of the card. Toasts and native dialogs float above
 * the whole app and outlive the screen that fired them — the delete toast lands
 * on the English saved list — so they stay in the app's language. The failure
 * toast already carried an English message from ApiError on one path and a
 * Hebrew one on the other.
 */

function trimmedName() {
  return { firstName: firstName.value.trim(), lastName: lastName.value.trim() };
}

async function onUpdate(): Promise<void> {
  showValidation.value = true;
  if (!isValid.value || !profile.value) return;

  const name = trimmedName();

  // An unsaved random profile is client-only: no request is made.
  if (!isSavedSource.value) {
    store.renameProfile(profile.value.externalId, name.firstName, name.lastName);
    firstName.value = name.firstName;
    lastName.value = name.lastName;
    toast.success('Profile updated in the list.');
    return;
  }

  try {
    await updateMutation.mutateAsync({ id: profile.value.id as string, name });
    toast.success('Profile updated.');
  } catch {
    toast.error('Update failed. The change was rolled back.');
  }
}

async function onSave(): Promise<void> {
  showValidation.value = true;
  if (!isValid.value || !profile.value) return;

  const name = trimmedName();
  // The current edited state is persisted, not the original provider values.
  const payload: Profile = { ...profile.value, ...name };

  try {
    const saved = await saveMutation.mutateAsync(payload);
    store.renameProfile(payload.externalId, name.firstName, name.lastName);
    store.markAsSaved(payload.externalId, saved.id);
    toast.success('Profile saved.');

    // The route is the single source of truth for a profile's source, so the
    // page moves to the saved route instead of quietly changing behaviour
    // while the URL still says /random.
    isLeavingDeliberately.value = true;
    await router.replace({ name: 'saved-detail', params: { id: saved.id } });
    isLeavingDeliberately.value = false;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Could not save this profile.');
  }
}

async function onDelete(): Promise<void> {
  // Captured up front: the optimistic removal clears `profile` before we land.
  const target = profile.value;
  if (!target?.id) return;
  if (!window.confirm('Delete this profile?')) return;

  isLeavingDeliberately.value = true;
  try {
    await deleteMutation.mutateAsync(target.id);
    store.markAsUnsaved(target.externalId);
    toast.success('Profile deleted.');
    await router.push({ name: 'saved-list' });
  } catch {
    isLeavingDeliberately.value = false;
    toast.error('Delete failed. The profile was restored.');
  }
}

function onBack(): void {
  void router.push({ name: isSavedSource.value ? 'saved-list' : 'random-list' });
}

/* ------------------------------------------------------------- display ---- */

const GENDER_LABELS: Record<string, string> = { male: 'זכר', female: 'נקבה' };

const genderLabel = computed(() => {
  const raw = profile.value?.gender ?? '';
  return GENDER_LABELS[raw.toLowerCase()] ?? raw;
});
const isGenderHebrew = computed(() => genderLabel.value !== profile.value?.gender);

const age = computed(() => (profile.value ? calculateAge(profile.value.dateOfBirth) : null));
const birthYear = computed(() =>
  profile.value ? getBirthYear(profile.value.dateOfBirth) : null,
);
const address = computed(() => (profile.value ? formatAddress(profile.value) : ''));
const displayName = computed(() =>
  [profile.value?.title, firstName.value, lastName.value].filter(Boolean).join(' '),
);
</script>

<template>
  <div class="page">
    <!-- Saved detail opened directly: the collection is still in flight. -->
    <ProfileSkeleton v-if="isSavedSource && savedQuery.isPending.value" :rows="1" />

    <ErrorState
      v-else-if="isSavedSource && savedQuery.isError.value"
      message="Could not load this profile."
      @retry="savedQuery.refetch()"
    />

    <!--
      A random profile lives only in memory for the current session. After a
      hard refresh it is genuinely gone, and saying so is more honest than
      quietly substituting a different person.
    -->
    <div v-else-if="!profile" class="missing card">
      <p>
        {{
          isSavedSource
            ? 'Profile no longer exists.'
            : 'This random profile is no longer available. Random results are not kept after a page reload.'
        }}
      </p>
      <button type="button" class="primary" @click="onBack">
        {{ isSavedSource ? 'Back to saved profiles' : 'Back to random profiles' }}
      </button>
    </div>

    <!--
      The detail layout is RTL with Hebrew labels, as the spec asks. Latin data
      inside it is isolated rather than merely aligned: `dir` plus
      `unicode-bidi: isolate` stops an email, a phone number or a house number
      from reordering against the surrounding Hebrew. Read-only values are
      pinned LTR; the name inputs resolve their own direction, because they are
      the only place a user can enter Hebrew.
    -->
    <article v-else class="detail card" dir="rtl" lang="he">
      <h1 class="visually-hidden">פרטי משתמש</h1>

      <div class="layout">
        <img class="portrait" :src="profile.pictureUrl" :alt="`תמונת הפרופיל של ${displayName}`" />

        <!--
          Field order pairs what belongs together: the two editable name inputs
          share a row, then the derived values, then contact. Address spans the
          full width because it is the longest single value.
        -->
        <dl class="fields">
          <div class="field">
            <dt><label for="first-name">שם פרטי</label></dt>
            <dd>
              <input
                id="first-name"
                v-model="firstName"
                class="auto-value"
                dir="auto"
                type="text"
                autocomplete="given-name"
                :aria-invalid="showValidation && !!firstNameError"
                :aria-describedby="showValidation && firstNameError ? 'first-name-error' : undefined"
              />
              <p v-if="showValidation && firstNameError" id="first-name-error" class="field-error">
                {{ firstNameError }}
              </p>
            </dd>
          </div>

          <div class="field">
            <dt><label for="last-name">שם משפחה</label></dt>
            <dd>
              <input
                id="last-name"
                v-model="lastName"
                class="auto-value"
                dir="auto"
                type="text"
                autocomplete="family-name"
                :aria-invalid="showValidation && !!lastNameError"
                :aria-describedby="showValidation && lastNameError ? 'last-name-error' : undefined"
              />
              <p v-if="showValidation && lastNameError" id="last-name-error" class="field-error">
                {{ lastNameError }}
              </p>
            </dd>
          </div>

          <div class="field">
            <dt>מין</dt>
            <dd>
              <span v-if="isGenderHebrew">{{ genderLabel }}</span>
              <bdi v-else class="ltr-value">{{ genderLabel }}</bdi>
            </dd>
          </div>

          <div class="field">
            <dt>גיל</dt>
            <dd>{{ age ?? '—' }}</dd>
          </div>

          <div class="field">
            <dt>שנת לידה</dt>
            <dd>{{ birthYear ?? '—' }}</dd>
          </div>

          <div class="field">
            <dt>מדינה</dt>
            <dd><bdi class="ltr-value">{{ profile.country }}</bdi></dd>
          </div>

          <div class="field field--wide">
            <dt>כתובת</dt>
            <dd><bdi class="ltr-value">{{ address || '—' }}</bdi></dd>
          </div>

          <div class="field">
            <dt>אימייל</dt>
            <dd><bdi class="ltr-value email">{{ profile.email }}</bdi></dd>
          </div>

          <div class="field">
            <dt>טלפון</dt>
            <dd><bdi class="ltr-value">{{ profile.phone }}</bdi></dd>
          </div>
        </dl>
      </div>

      <!--
        Actions sit at the RTL start edge so the primary action lands where the
        eye finishes reading the form.
      -->
      <div class="actions">
        <button
          v-if="!isSavedSource"
          type="button"
          class="primary"
          :disabled="isBusy"
          @click="onSave"
        >
          {{ saveMutation.isPending.value ? 'שומר…' : 'שמירה' }}
        </button>

        <button type="button" class="primary" :disabled="isBusy || !isDirty" @click="onUpdate">
          {{ updateMutation.isPending.value ? 'מעדכן…' : 'עדכון' }}
        </button>

        <button
          v-if="isSavedSource"
          type="button"
          class="danger"
          :disabled="isBusy"
          @click="onDelete"
        >
          {{ deleteMutation.isPending.value ? 'מוחק…' : 'מחיקה' }}
        </button>

        <button type="button" :disabled="isBusy" @click="onBack">חזרה</button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.missing {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.missing p {
  margin: 0;
}

.detail {
  padding: var(--space-5);
}

.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-5);
  align-items: start;
}

.portrait {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}

.fields {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.field {
  min-width: 0;
}

.field--wide {
  grid-column: 1 / -1;
}

dt {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: var(--space-1);
}

dd {
  margin: 0;
  font-weight: 500;
}

.email {
  overflow-wrap: anywhere;
}

.field-error {
  margin: var(--space-1) 0 0;
  font-size: 0.8rem;
  color: var(--color-danger);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .portrait {
    max-width: 200px;
  }

  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
