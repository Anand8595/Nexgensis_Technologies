import { Link } from 'react-router-dom';
import {
  formatCurrency,
  getRatingBadgeClass,
  getStockStatus,
} from '../../utils/formatters';
import { Star, Eye, Edit3, Trash2, ImageOff } from 'lucide-react';
import { useState } from 'react';

function CardThumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-200/80 shrink-0"
    />
  );
}

export default function ProductCardGrid({
  products = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        const ratingClass = getRatingBadgeClass(product.rating);

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Header: Thumbnail + Title + Category */}
              <div className="flex items-start gap-3">
                <CardThumbnail
                  src={product.thumbnail || (product.images && product.images[0])}
                  alt={product.title}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 capitalize truncate max-w-[120px]">
                      {product.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold border ${ratingClass}`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{Number(product.rating || 0).toFixed(1)}</span>
                    </span>
                  </div>

                  <Link
                    to={`/products/${product.id}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 text-sm leading-snug"
                  >
                    {product.title}
                  </Link>

                  {product.brand && (
                    <span className="text-xs text-slate-400 font-medium block mt-0.5 truncate">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Stock info */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-xs text-emerald-600 font-medium ml-1.5">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stockStatus.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dotClass}`}></span>
                  {stockStatus.label}
                </span>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/products/${product.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
