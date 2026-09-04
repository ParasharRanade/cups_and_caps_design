/* ==========================================================================
   Cups & Caps Design - Instant Tiered Quote & Bulk Pricing Engine (India / INR ₹)
   ========================================================================== */

export const PRODUCT_CATALOG = {
  'ceramic-mug': {
    name: 'Artisan Ceramic Mug (11oz)',
    category: 'drinkware',
    basePrice: 249, // in INR ₹
    minQty: 1,
    leadTimeDays: 5,
    colors: ['#FFFFFF', '#FAF8F5', '#E05A36', '#1E293B', '#334155', '#2E5A44'],
    defaultColor: '#FFFFFF',
    methods: ['ceramic-glaze', 'full-sublimation']
  },
  'steel-tumbler': {
    name: 'Insulated Travel Tumbler (20oz)',
    category: 'drinkware',
    basePrice: 599, // in INR ₹
    minQty: 1,
    leadTimeDays: 6,
    colors: ['#1E293B', '#FAF8F5', '#E05A36', '#2563EB', '#2E5A44', '#78716C'],
    defaultColor: '#1E293B',
    methods: ['laser-etch', 'full-sublimation']
  },
  'enamel-mug': {
    name: 'Campfire Speckled Enamel Mug (12oz)',
    category: 'drinkware',
    basePrice: 349, // in INR ₹
    minQty: 1,
    leadTimeDays: 5,
    colors: ['#FAF8F5', '#E05A36', '#1E293B', '#0D9488', '#D97706'],
    defaultColor: '#FAF8F5',
    methods: ['ceramic-glaze', 'laser-etch']
  },
  'dad-hat': {
    name: 'Vintage Washed Cotton Dad Hat',
    category: 'headwear',
    basePrice: 399, // in INR ₹
    minQty: 1,
    leadTimeDays: 5,
    colors: ['#E05A36', '#1E293B', '#334155', '#FAF8F5', '#2E5A44', '#D97706', '#991B1B'],
    defaultColor: '#E05A36',
    methods: ['3d-puff', 'flat-embroidery', 'leather-patch']
  },
  'trucker-cap': {
    name: 'Retro 5-Panel Trucker Snapback',
    category: 'headwear',
    basePrice: 349, // in INR ₹
    minQty: 1,
    leadTimeDays: 5,
    colors: ['#FAF8F5', '#1E293B', '#334155', '#E05A36', '#2563EB'],
    defaultColor: '#FAF8F5',
    meshColor: '#1E293B',
    methods: ['3d-puff', 'flat-embroidery', 'leather-patch']
  },
  'knit-beanie': {
    name: 'Cuffed Fisherman Ribbed Beanie',
    category: 'headwear',
    basePrice: 299, // in INR ₹
    minQty: 1,
    leadTimeDays: 4,
    colors: ['#334155', '#1E293B', '#FAF8F5', '#E05A36', '#D97706', '#0D9488'],
    defaultColor: '#334155',
    methods: ['flat-embroidery', 'leather-patch']
  }
};

/**
 * Format currency in Indian numbering system (e.g. ₹1,49,999.00 or ₹1,499)
 */
export function formatINR(val) {
  return '₹' + Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

export function calculateQuote({
  productId = 'ceramic-mug',
  quantity = 24,
  method = 'ceramic-glaze',
  packaging = false,
  customLabel = false,
  rush = false
}) {
  const product = PRODUCT_CATALOG[productId] || PRODUCT_CATALOG['ceramic-mug'];
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  // 1. Determine Tier Discount Percentage
  let discountTierPercent = 0;
  let tierName = 'Sample Tier';

  if (qty >= 500) {
    discountTierPercent = 0.52; // 52% off
    tierName = 'Enterprise Tier (Pan-India)';
  } else if (qty >= 144) {
    discountTierPercent = 0.40; // 40% off
    tierName = 'Wholesale Master';
  } else if (qty >= 48) {
    discountTierPercent = 0.28; // 28% off
    tierName = 'Commercial Bulk';
  } else if (qty >= 12) {
    discountTierPercent = 0.15; // 15% off
    tierName = 'Boutique Batch';
  }

  // 2. Base Unit Price with Volume Discount
  let unitPrice = product.basePrice * (1 - discountTierPercent);

  // 3. Method modifier in INR ₹
  if (method === '3d-puff') unitPrice += 49;
  else if (method === 'leather-patch') unitPrice += 69;
  else if (method === 'laser-etch') unitPrice += 39;

  // 4. Addons per unit in INR ₹
  if (packaging) unitPrice += 35;   // Presentation Gift Box
  if (customLabel) unitPrice += 25; // Custom inside woven tag

  // 5. Setup Fee: ₹499 standard, waived on 48+ units!
  const setupFee = qty >= 48 ? 0 : 499.00;

  // 6. Subtotal
  let subtotal = (unitPrice * qty) + setupFee;

  // 7. Rush Delivery (Express 48H across India)
  let rushFee = 0;
  if (rush) {
    rushFee = subtotal * 0.15;
    subtotal += rushFee;
  }

  // Calculate regular total for savings comparison
  const regularTotal = (product.basePrice * qty) + 499.00;
  const totalSavings = Math.max(0, regularTotal - subtotal);

  return {
    productId,
    productName: product.name,
    quantity: qty,
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    setupFee: parseFloat(setupFee.toFixed(2)),
    rushFee: parseFloat(rushFee.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountTierPercent: Math.round(discountTierPercent * 100),
    tierName,
    totalSavings: parseFloat(totalSavings.toFixed(2)),
    isSetupWaived: setupFee === 0
  };
}
