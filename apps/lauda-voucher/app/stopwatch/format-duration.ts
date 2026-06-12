export function formatDuration(totalMs: number): string {
  const safeMs = Math.max(0, totalMs);
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1000);
  const hundredths = Math.floor((safeMs % 1000) / 10);

  const pad = (value: number, length = 2) =>
    value.toString().padStart(length, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}
