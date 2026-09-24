export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-pulse">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 rounded"></div>
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
      </div>

      {/* Row Skeletons */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
            {/* Image + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>

            {/* Category */}
            <div className="w-24">
              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            </div>

            {/* Price */}
            <div className="w-20">
              <div className="h-4 bg-slate-200 rounded w-14"></div>
            </div>

            {/* Rating */}
            <div className="w-20">
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>

            {/* Stock */}
            <div className="w-24">
              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            </div>

            {/* Action buttons */}
            <div className="w-24 flex items-center justify-end gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-5 bg-slate-200 rounded-full w-20"></div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded w-16"></div>
            <div className="h-5 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
