export const ALLOWED_PAGE_SIZES = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const SORT_OPTIONS = [
  { label: 'Default', value: '', order: 'asc' },
  { label: 'Price: Low to High', value: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price', order: 'desc' },
  { label: 'Rating: High to Low', value: 'rating', order: 'desc' },
  { label: 'Rating: Low to High', value: 'rating', order: 'asc' },
  { label: 'Title: A to Z', value: 'title', order: 'asc' },
  { label: 'Title: Z to A', value: 'title', order: 'desc' },
  { label: 'Stock: Low to High', value: 'stock', order: 'asc' },
  { label: 'Stock: High to Low', value: 'stock', order: 'desc' },
];

/**
 * Safely parse query parameters with defensive fallback values.
 * Guards against ?page=abc, negative values, invalid limits, etc.
 */
export function parseProductQueryParams(searchParams) {
  // Page validation: must be a positive integer
  const rawPage = parseInt(searchParams.get('page'), 10);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  // Limit validation: must be one of [10, 20, 50]
  const rawLimit = parseInt(searchParams.get('limit'), 10);
  const limit = ALLOWED_PAGE_SIZES.includes(rawLimit) ? rawLimit : DEFAULT_PAGE_SIZE;

  // Search validation: clean string
  const rawSearch = searchParams.get('search') || searchParams.get('q') || '';
  const search = typeof rawSearch === 'string' ? rawSearch.trim() : '';

  // Category validation
  const rawCategory = searchParams.get('category') || '';
  const category = rawCategory === 'all' ? '' : rawCategory.trim();

  // Sort validation
  const rawSortBy = searchParams.get('sortBy') || '';
  const allowedSortFields = ['price', 'rating', 'title', 'stock'];
  const sortBy = allowedSortFields.includes(rawSortBy) ? rawSortBy : '';

  // Order validation
  const rawOrder = (searchParams.get('order') || '').toLowerCase();
  const order = rawOrder === 'desc' ? 'desc' : 'asc';

  // Delay simulation (for race condition & slow network testing)
  const rawDelay = parseInt(searchParams.get('delay'), 10);
  const delay = !isNaN(rawDelay) && rawDelay > 0 ? Math.min(rawDelay, 10000) : 0;

  return {
    page,
    limit,
    search,
    category,
    sortBy,
    order,
    delay,
  };
}

/**
 * Cleanly serialize query parameters, omitting empty/default values
 */
export function serializeProductQueryParams({
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  search = '',
  category = '',
  sortBy = '',
  order = 'asc',
  delay = 0,
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set('page', page.toString());
  }

  if (limit !== DEFAULT_PAGE_SIZE && ALLOWED_PAGE_SIZES.includes(limit)) {
    params.set('limit', limit.toString());
  }

  if (search && search.trim()) {
    params.set('search', search.trim());
  }

  if (category && category !== 'all') {
    params.set('category', category);
  }

  if (sortBy) {
    params.set('sortBy', sortBy);
    if (order === 'desc') {
      params.set('order', 'desc');
    }
  }

  if (delay > 0) {
    params.set('delay', delay.toString());
  }

  return params;
}
