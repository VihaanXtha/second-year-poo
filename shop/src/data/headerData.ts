export interface HeaderBrand {
  name: string;
}

export interface HeaderType {
  id: string;
  name: string;
}

export interface HeaderSubcategory {
  id: string;
  name: string;
  types: HeaderType[];
}

export interface HeaderCategory {
  id: string;
  name: string;
  subcategories: HeaderSubcategory[];
}

export const FAKE_BRANDS: HeaderBrand[] = [
  { name: 'COSRX' },
  { name: 'The Ordinary' },
  { name: 'Laneige' },
  { name: 'Innisfree' },
  { name: 'Etude House' },
  { name: 'Missha' },
  { name: 'Skinfood' },
  { name: 'TonyMoly' },
  { name: 'Purito' },
  { name: 'Benton' },
  { name: 'Neogen' },
  { name: 'Holika Holika' },
];

export const FAKE_CATEGORIES: HeaderCategory[] = [
  {
    id: 'cat-skincare',
    name: 'Skincare',
    subcategories: [
      { id: 'sub-cleanser', name: 'Cleanser', types: [{ id: 't1', name: 'Oil Cleanser' }, { id: 't2', name: 'Water Cleanser' }, { id: 't3', name: 'Balm Cleanser' }] },
      { id: 'sub-toner', name: 'Toner', types: [{ id: 't4', name: 'Essence Toner' }, { id: 't5', name: 'pH Toner' }] },
      { id: 'sub-serum', name: 'Serum', types: [{ id: 't6', name: 'Vitamin C' }, { id: 't7', name: 'Hyaluronic Acid' }, { id: 't8', name: 'Niacinamide' }] },
      { id: 'sub-moisturizer', name: 'Moisturizer', types: [{ id: 't9', name: 'Cream' }, { id: 't10', name: 'Gel' }] },
      { id: 'sub-sunscreen', name: 'Sunscreen', types: [{ id: 't11', name: 'Mineral' }, { id: 't12', name: 'Chemical' }] },
    ],
  },
  {
    id: 'cat-makeup',
    name: 'Makeup',
    subcategories: [
      { id: 'sub-lip', name: 'Lip', types: [{ id: 't13', name: 'Tint' }, { id: 't14', name: 'Lipstick' }, { id: 't15', name: 'Gloss' }] },
      { id: 'sub-eye', name: 'Eye', types: [{ id: 't16', name: 'Shadow' }, { id: 't17', name: 'Mascara' }, { id: 't18', name: 'Liner' }] },
      { id: 'sub-face', name: 'Face', types: [{ id: 't19', name: 'Foundation' }, { id: 't20', name: 'Concealer' }] },
    ],
  },
  {
    id: 'cat-hair',
    name: 'Hair Care',
    subcategories: [
      { id: 'sub-shampoo', name: 'Shampoo', types: [{ id: 't21', name: 'Volumizing' }, { id: 't22', name: 'Hydrating' }] },
      { id: 'sub-mask', name: 'Hair Mask', types: [{ id: 't23', name: 'Protein' }, { id: 't24', name: 'Moisture' }] },
    ],
  },
  {
    id: 'cat-body',
    name: 'Body Care',
    subcategories: [{ id: 'sub-lotion', name: 'Lotion', types: [{ id: 't25', name: 'Daily' }, { id: 't26', name: 'Intense' }] }],
  },
  {
    id: 'cat-tools',
    name: 'Tools',
    subcategories: [{ id: 'sub-brush', name: 'Brushes', types: [{ id: 't27', name: 'Puff' }, { id: 't28', name: 'Sponge' }] }],
  },
];

export function getBrandSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getCategorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}