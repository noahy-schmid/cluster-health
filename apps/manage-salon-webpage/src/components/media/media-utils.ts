export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/ico",
];

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  allowedMimeTypes: string[] = ALLOWED_MIME_TYPES,
  maxSize: number = DEFAULT_MAX_FILE_SIZE,
): ValidationResult {
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Dateityp nicht erlaubt. Erlaubt: JPEG, PNG, WebP, GIF, ICO`,
    };
  }
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Datei zu gross. Maximum: 10MB",
    };
  }
  return { valid: true };
}
