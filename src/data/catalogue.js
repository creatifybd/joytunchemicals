export const careCategories = [
  { id: 'laundry', name: 'Laundry care', cat: 'Detergent', title: 'A fresh start.', description: 'For the clothes you live in.', image: 'aro-detergent', color: '#edf1dd' },
  { id: 'hand', name: 'Hand care', cat: 'Hand Wash', title: 'Little moments of care.', description: 'A refreshing part of your routine.', image: 'nolive-apple-green-pump', color: '#e8eedf' },
  { id: 'kitchen', name: 'Kitchen care', cat: 'Dish Wash', title: 'Back to sparkling.', description: 'For everything around your table.', image: 'vix-orange-bottle', color: '#fff0dd' },
  { id: 'floor', name: 'Floor care', cat: 'Floor Cleaner', title: 'Room to feel good.', description: 'Freshness, from the ground up.', image: 'layzen-floral', color: '#f6e8ee' },
  { id: 'glass', name: 'Glass care', cat: 'Glass Cleaner', title: 'A clearer outlook.', description: 'Care for glass and mirrors.', image: 'mr-glasso-spray', color: '#e9f1f7' },
  { id: 'bathroom', name: 'Bathroom care', cat: 'Toilet Cleaner', title: 'Care in every corner.', description: 'An essential for your cleaning routine.', image: 't-flush-toilet-cleaner', color: '#edecf8' },
];

// The 22 approved PNG mockups from the supplied archive. Images are byte-for-byte originals.
const entries = [
  ['aro-detergent', 'Aro', 'Synthetic Detergent Powder', 'Fresh Green', 'Pouch', 'laundry'],
  ['sharo-detergent', 'Sharo', 'Synthetic Detergent Powder', 'Fresh fragrance', 'Pouch', 'laundry'],
  ['rio-detergent', 'Rio', 'Synthetic Detergent Powder', 'Deep Clean', 'Pouch', 'laundry'],
  ['nolive-apple-green-pump', 'n’Olive', 'Hand Wash', 'Apple Green', 'Pump bottle', 'hand'],
  ['nolive-lavender-pump', 'n’Olive', 'Hand Wash', 'Lavender', 'Pump bottle', 'hand'],
  ['nolive-ocean-blue-pump', 'n’Olive', 'Hand Wash', 'Ocean Blue', 'Pump bottle', 'hand'],
  ['nolive-gold-fresh-pump', 'n’Olive', 'Hand Wash', 'Gold Fresh', 'Pump bottle', 'hand'],
  ['nolive-apple-green-refill', 'n’Olive', 'Hand Wash', 'Apple Green', 'Refill pouch', 'hand'],
  ['nolive-lavender-refill', 'n’Olive', 'Hand Wash', 'Lavender', 'Refill pouch', 'hand'],
  ['nolive-ocean-blue-refill', 'n’Olive', 'Hand Wash', 'Ocean Blue', 'Refill pouch', 'hand'],
  ['nolive-gold-fresh-refill', 'n’Olive', 'Hand Wash', 'Gold Fresh', 'Refill pouch', 'hand'],
  ['vix-lemon-bottle', 'Vix', 'Dish Wash Liquid', 'Lemon', 'Bottle', 'kitchen'],
  ['vix-orange-bottle', 'Vix', 'Dish Wash Liquid', 'Orange', 'Bottle', 'kitchen'],
  ['vix-lemon-refill', 'Vix', 'Dish Wash Liquid', 'Lemon', 'Refill pouch', 'kitchen'],
  ['vix-orange-refill', 'Vix', 'Dish Wash Liquid', 'Orange', 'Refill pouch', 'kitchen'],
  ['vix-lemon-bar', 'Vix', 'Dish Wash Bar', 'Lemon', '300 g bar', 'kitchen'],
  ['vix-orange-bar', 'Vix', 'Dish Wash Bar', 'Orange', '300 g bar', 'kitchen'],
  ['layzen-lemon', 'Layzen', 'Liquid Floor Cleaner', 'Lemon', '1 L bottle', 'floor'],
  ['layzen-floral', 'Layzen', 'Liquid Floor Cleaner', 'Floral', '1 L bottle', 'floor'],
  ['mr-glasso-spray', 'Mr. Glasso', 'Glass Cleaner', 'Original', 'Trigger spray', 'glass'],
  ['mr-glasso-refill', 'Mr. Glasso', 'Glass Cleaner', 'Original', 'Refill bottle', 'glass'],
  ['t-flush-toilet-cleaner', 'T-Flush', 'Toilet Cleaner', 'Original', '750 ml bottle', 'bathroom'],
];

const descriptions = {
  laundry: 'Make laundry part of a fresher everyday. A synthetic detergent powder for your regular clothes-washing routine. Follow the directions on the pack for use and dosage.',
  hand: 'Bring a little freshness to your everyday hand-washing routine. Explore the n’Olive collection in four fragrance variants, with pump bottles and matching refill pouches.',
  kitchen: 'From everyday plates to the washing-up after a shared meal, Vix is made for your dish-care routine. Choose your preferred citrus variant and pack format.',
  floor: 'A fresh finishing touch for your cleaning routine. Layzen liquid floor cleaner comes in Lemon and Floral variants. Follow the label for dilution and suitable surfaces.',
  glass: 'Give your glass-cleaning routine a dedicated companion. Mr. Glasso is available in a convenient trigger spray and a refill bottle. Follow the directions on the product label.',
  bathroom: 'A dedicated cleaner for your toilet-care routine, in an angled-neck bottle. Read and follow the safety and application instructions on the label. Never mix cleaning products.',
};

export const approvedProducts = entries.map(([slug, brand, type, variant, format, category], index) => ({
  id: `joytun-${slug}`, order: index, slug, brand, type, variant, format, category,
  name: `${brand} ${type}`, cat: careCategories.find(c => c.id === category).cat,
  img: `/images/products/${slug}.png`, images: [`/images/products/${slug}.png`],
  desc: descriptions[category], variants: `${variant} · ${format}`, feats: '', status: 'active',
}));

// These six legacy family cards are replaced by the approved individual variants.
const legacyIds = new Set(['2VqKcNhGaJDDdcQ5jz8P', 'GSCF1oQTMfNZOwoF4MBD', 'UPchN0eAp36hMXbvSZcb', 'YW0IEk3seLxFLGRGfPpR', 'qFZbsuOBjzvf9tFB4MFP', 'tWAIvhaR4gpd53qA4OaE']);
export const isBabyProduct = p => /baby|শিশু/i.test(`${p.name || ''} ${p.cat || ''} ${p.category || ''}`);
export function mergeCatalogue(remote = []) {
  const byId = new Map(remote.map(p => [p.id, p]));
  const merged = approvedProducts.map(original => ({ ...original, ...byId.get(original.id) }));
  const knownIds = new Set(approvedProducts.map(p => p.id));
  return [...merged, ...remote.filter(p => !knownIds.has(p.id) && !legacyIds.has(p.id))].filter(p => !isBabyProduct(p));
}

export function getCategory(product, categories = careCategories) {
  return categories.find(c => c.id === product.category) || categories.find(c => c.cat === product.cat) || { id: 'other', name: product.cat || 'Everyday care', color:'#eef0e8' };
}

export function filterCatalogue(products, category = 'all', query = '', categories = careCategories) {
  const normalize = value => value.normalize('NFKD').toLowerCase().replace(/[’'‘-]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return products.filter(p => p.status === 'active' && !isBabyProduct(p) && (category === 'all' || getCategory(p, categories).id === category) && words.every(word => normalize(`${p.name} ${p.brand || ''} ${p.variant || ''} ${p.format || ''} ${p.cat || ''} ${p.slug || ''}`).includes(word))).sort((a,b)=>(a.order??999)-(b.order??999));
}

export const companyDetails = {
  name: 'Joytun Chemical Industries OPC',
  email: 'info@joytunchemicals.com',
  phone: '+880 17999-96410',
  office: 'Kanchpur, Sonargaon, Narayanganj, Bangladesh.',
  factory: 'Kanchpur, Sonargaon, Narayanganj, Bangladesh.',
};
