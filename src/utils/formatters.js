/**
 * Format number as USD currency
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date string into human readable string
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Returns visual color classes for rating value
 */
export function getRatingBadgeClass(rating) {
  const r = Number(rating) || 0;
  if (r >= 4.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (r >= 3.5) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (r >= 2.5) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

/**
 * Returns stock level categorization and styling
 */
export function getStockStatus(stock) {
  const s = Number(stock) || 0;
  if (s <= 0) {
    return {
      label: 'Out of Stock',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      isLow: true,
      isOut: true,
    };
  }
  if (s <= 10) {
    return {
      label: `Low Stock (${s})`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
      isLow: true,
      isOut: false,
    };
  }
  return {
    label: `In Stock (${s})`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    isLow: false,
    isOut: false,
  };
}
