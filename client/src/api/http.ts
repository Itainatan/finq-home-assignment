/** An HTTP failure the UI is allowed to reason about. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

/**
 * Raw server internals never reach the user. Statuses the UI reacts to get a
 * written message; everything else collapses to one generic line.
 */
function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The profile could not be accepted. Please check the details and try again.';
    case 404:
      return 'Profile no longer exists.';
    case 409:
      return 'Profile already saved.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    // Network-level failure: there is no status to reason about.
    throw new ApiError(0, 'Something went wrong. Please try again.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, messageForStatus(response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
