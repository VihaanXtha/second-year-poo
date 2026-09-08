export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getBrandSlug(name: string): string {
  return generateSlug(name);
}

export function getCategorySlug(name: string): string {
  return generateSlug(name);
}