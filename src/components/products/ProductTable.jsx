import { Link } from 'react-router-dom';
import {
  formatCurrency,
  getRatingBadgeClass,
  getStockStatus,
} from '../../utils/formatters';
import { Star, Eye, Edit3, Trash2, ImageOff } from 'lucide-react';
import { useState } from 'react';

function ProductThumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200/80 shrink-0 group-hover:scale-105 transition-transform"
    />
  );
}

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3">Product</th>
              <th scope="col" className="px-3 py-3.5">Category</th>
              <th scope="col" className="px-3 py-3.5">Price</th>
              <th scope="col" className="px-3 py-3.5">Rating</th>
              <th scope="col" className="px-3 py-3.5">Stock</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const ratingClass = getRatingBadgeClass(product.rating);

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Image & Title */}
                  <td className="py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail
                        src={product.thumbnail || (product.images && product.images[0])}
                        alt={product.title}
                      />
                      <div className="flex flex-col min-w-0 max-w-[260px] lg:max-w-xs">
                        <Link
                          to={`/products/${product.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand && (
                            <span className="text-xs text-slate-400 font-medium truncate">
                              {product.brand}
                            </span>
                          )}
                          {product.sku && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate">
                              {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 capitalize">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    <div>
                      {formatCurrency(product.price)}
                      {product.discountPercentage > 0 && (
                        <span className="block text-[11px] font-normal text-emerald-600">
                          {product.discountPercentage}% off
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${ratingClass}`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{Number(product.rating || 0).toFixed(1)}</span>
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stockStatus.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dotClass}`}></span>
                      {stockStatus.label}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* View Details */}
                      <Link
                        to={`/products/${product.id}`}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
