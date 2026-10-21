export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message?: string,
    readonly code?: string,
    readonly fields: FieldErrors = {},
  ) {
    super(message);
  }
}

/** Turns an API error response into an ApiError with its message, code and the first error of each field. */
export function toApiError(status: number, data: unknown) {
  const body = (data ?? {}) as { message?: unknown; code?: unknown; errors?: Record<string, unknown> };
  const fields = Object.fromEntries(
    Object.entries(body.errors ?? {}).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]),
  );
  return new ApiError(
    status,
    typeof body.message === "string" ? body.message : undefined,
    typeof body.code === "string" ? body.code : undefined,
    fields,
  );
}
