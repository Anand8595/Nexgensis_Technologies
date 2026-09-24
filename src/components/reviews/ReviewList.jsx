import { Star, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function ReviewList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
        <p className="text-sm text-slate-500 font-medium">
          No customer reviews available for this product yet.
        </p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = (
    reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Reviews Summary Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Customer Feedback</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(Number(avgRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-extrabold text-slate-800">{avgRating} / 5</span>
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {review.reviewerName ? review.reviewerName.charAt(0) : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {review.reviewerName || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (review.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
