import { apiRequest } from '@/api/http';
import type { EditableName, Profile } from '@/types/profile';

/** The wire shape returned by the backend. `dateOfBirth` arrives as ISO 8601. */
interface SavedProfileDto {
  id: string;
  externalId: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  state: string | null;
  city: string | null;
  streetName: string | null;
  streetNumber: string | null;
  pictureUrl: string;
  thumbnailUrl: string;
}

/** Backend profiles are folded into the same model the rest of the app uses. */
function toProfile(dto: SavedProfileDto): Profile {
  return {
    id: dto.id,
    source: 'saved',
    externalId: dto.externalId,
    title: dto.title,
    firstName: dto.firstName,
    lastName: dto.lastName,
    gender: dto.gender,
    email: dto.email,
    phone: dto.phone,
    dateOfBirth: dto.dateOfBirth,
    country: dto.country,
    state: dto.state ?? undefined,
    city: dto.city ?? undefined,
    streetName: dto.streetName ?? undefined,
    streetNumber: dto.streetNumber ?? undefined,
    pictureUrl: dto.pictureUrl,
    thumbnailUrl: dto.thumbnailUrl,
  };
}

/** `id` and `source` are ours, not the server's, so they are stripped on write. */
function toCreatePayload(profile: Profile) {
  const { id, source, ...rest } = profile;
  void id;
  void source;
  return rest;
}

export async function listSavedProfiles(): Promise<Profile[]> {
  const dtos = await apiRequest<SavedProfileDto[]>('/api/profiles');
  return dtos.map(toProfile);
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const dto = await apiRequest<SavedProfileDto>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(toCreatePayload(profile)),
  });
  return toProfile(dto);
}

export async function updateProfileName(id: string, name: EditableName): Promise<Profile> {
  const dto = await apiRequest<SavedProfileDto>(`/api/profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(name),
  });
  return toProfile(dto);
}

export async function deleteProfile(id: string): Promise<void> {
  await apiRequest<void>(`/api/profiles/${id}`, { method: 'DELETE' });
}
