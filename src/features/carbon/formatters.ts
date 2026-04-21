export function formatCO2(grams: number): string {
  if (!grams || grams < 0.05) {
    return '0g';
  }

  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }

  if (grams >= 100) {
    return `${Math.round(grams)}g`;
  }

  return `${grams.toFixed(1)}g`;
}

export function formatDuration(durationMs: number): string {
  if (!durationMs || durationMs < 60000) {
    return '<1m';
  }

  const totalMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
