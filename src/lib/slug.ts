export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    // Remove combining diacritical marks (accents, cedilla, etc.)
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
