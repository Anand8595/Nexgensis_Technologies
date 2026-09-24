import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { SORT_OPTIONS } from '../../utils/urlParams';
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Clock,
  Info,
} from 'lucide-react';

export default function ProductFilters({
  search = '',
  category = '',
  sortBy = '',
  order = 'asc',
  delay = 0,
  categories = [],
  isCombinedFilter = false,
  onFilterChange,
}) {
  // Local state for instant keystroke response while debouncing
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync internal input when external search prop updates (e.g. back button or clear)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // When debounced value changes, notify parent and automatically reset page to 1
  useEffect(() => {
    if (debouncedSearch !== search) {
      onFilterChange({
        search: debouncedSearch,
        page: 1, // Reset to page 1 on search change as specified in rules
      });
    }
  }, [debouncedSearch, search, onFilterChange]);

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ search: '', page: 1 });
  };

  const handleCategoryChange = (newCat) => {
    onFilterChange({
      category: newCat === 'all' ? '' : newCat,
      page: 1,
    });
  };

  const handleSortChange = (e) => {
    const selected = SORT_OPTIONS.find((s) => `${s.value}-${s.order}` === e.target.value);
    if (selected) {
      onFilterChange({
        sortBy: selected.value,
        order: selected.order,
      });
    } else {
      onFilterChange({ sortBy: '', order: 'asc' });
    }
  };

  const handleToggleDelay = () => {
    // Toggles between 0 and 2000ms delay for evaluating race condition safety
    const nextDelay = delay > 0 ? 0 : 2000;
    onFilterChange({ delay: nextDelay });
  };

  const hasActiveFilters = Boolean(search || category || sortBy || delay > 0);

  const handleClearAll = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      category: '',
      sortBy: '',
      order: 'asc',
      delay: 0,
      page: 1,
    });
  };

  // Find currently active sort option value
  const currentSortVal = `${sortBy}-${order}`;

  return (
    <div className="space-y-3">
      {/* Main Filter Control Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Left: Search input with debounce & clear */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by title, brand, or specs..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center/Right: Category filter, Sort, and Delay simulator */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={category || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={currentSortVal}
              onChange={handleSortChange}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Race Condition / Delay Simulator Toggle */}
          <button
            type="button"
            onClick={handleToggleDelay}
            title="Simulates 2-second API latency (&delay=2000) to test that fast typing never lets outdated requests overwrite newer ones"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              delay > 0
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{delay > 0 ? 'Latency: 2000ms ON' : 'Test Latency (2s)'}</span>
          </button>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanatory banner if both Category and Search are active */}
      {isCombinedFilter && (
        <div className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <p>
            <span className="font-semibold">Combined filter active:</span> DummyJSON API does not natively support simultaneous category filtering and text search. We seamlessly query the category catalog and apply client-side search indexing to fulfill your request!
          </p>
        </div>
      )}
    </div>
  );
}
