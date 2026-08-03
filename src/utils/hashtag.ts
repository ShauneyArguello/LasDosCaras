export function normalizeHashtag(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, '');
}
