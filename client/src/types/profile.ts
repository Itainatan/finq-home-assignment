/** Where a profile currently lives. This drives which actions the detail page offers. */
export type ProfileSource = 'random' | 'saved';

/**
 * The application's own profile model.
 *
 * The nested RandomUser response shape is deliberately kept out of the app:
 * everything past the provider boundary speaks this type instead.
 */
export interface Profile {
  /** Database identity. Present only once the profile has been saved. */
  id?: string;
  source: ProfileSource;
  /** Identity at the RandomUser boundary. Stable across save. */
  externalId: string;

  title: string;
  firstName: string;
  lastName: string;

  gender: string;

  email: string;
  phone: string;

  /** ISO 8601. Age and birth year are derived, never stored. */
  dateOfBirth: string;

  country: string;
  state?: string;
  city?: string;

  streetName?: string;
  streetNumber?: string;

  pictureUrl: string;
  thumbnailUrl: string;
}

/** The subset of a profile the user is allowed to change. */
export interface EditableName {
  firstName: string;
  lastName: string;
}
