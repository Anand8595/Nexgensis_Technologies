import { SearchX, RotateCcw, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No products found',
  message = 'We could not find any products matching your current search or filter criteria.',
  onResetFilters,
  onAddNew,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </button>
        )}

        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        )}
      </div>
    </div>
  );
}
