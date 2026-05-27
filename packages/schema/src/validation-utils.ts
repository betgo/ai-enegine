export type ValidationErrors = string[];

export function validatePositiveInteger(
  value: unknown,
  path: string,
  errors: ValidationErrors
): void {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    errors.push(`${path} must be a positive integer`);
  }
}

export function validatePositiveNumber(
  value: unknown,
  path: string,
  errors: ValidationErrors
): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    errors.push(`${path} must be a positive number`);
  }
}

export function validateNonNegativeInteger(
  value: unknown,
  path: string,
  errors: ValidationErrors
): void {
  if (!Number.isInteger(value) || (value as number) < 0) {
    errors.push(`${path} must be a non-negative integer`);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
