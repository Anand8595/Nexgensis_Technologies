import { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ProductFormModal({
  isOpen,
  mode = 'add', // 'add' | 'edit'
  product = null,
  categories = [],
  onSubmit,
  onClose,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    discountPercentage: '',
    stock: '',
    brand: '',
    rating: '4.5',
    description: '',
    thumbnail: '',
  });

  const [errors, setErrors] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  // Ref lock to prevent rapid multiple clicks
  const submitLockRef = useRef(false);

  // Sync form values on open or product edit change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setFormData({
          title: product.title || '',
          category: product.category || (categories[0]?.slug || ''),
          price: product.price ?? '',
          discountPercentage: product.discountPercentage ?? '',
          stock: product.stock ?? '',
          brand: product.brand || '',
          rating: product.rating ?? '4.5',
          description: product.description || '',
          thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
        });
        setThumbnailPreview(product.thumbnail || (product.images && product.images[0]) || '');
      } else {
        setFormData({
          title: '',
          category: categories[0]?.slug || 'beauty',
          price: '',
          discountPercentage: '',
          stock: '15',
          brand: '',
          rating: '4.5',
          description: '',
          thumbnail: '',
        });
        setThumbnailPreview('');
      }
      setErrors({});
      submitLockRef.current = false;
    }
  }, [isOpen, mode, product, categories]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }

    if (
      formData.stock === '' ||
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.thumbnail && !/^https?:\/\/.+/i.test(formData.thumbnail)) {
      newErrors.thumbnail = 'Thumbnail must be a valid web URL (e.g. https://...)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'thumbnail') {
      setThumbnailPreview(value);
    }

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent rapid multiple submissions
    if (isSubmitting || submitLockRef.current) return;

    if (!validate()) {
      return;
    }

    submitLockRef.current = true;
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      rating: Number(formData.rating || 4.5),
      discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-xl w-full my-8 p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'add'
                ? 'Fill in the information to add a product to inventory.'
                : `Modifying details for "${product?.title || 'Product'}".`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Noise Canceling Headphones"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 capitalize"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Sony, Apple"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Price, Discount & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  errors.price
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.price && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount (%) <span className="text-slate-400 font-normal">(Opt)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  errors.stock
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.stock && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe key features, dimensions, specifications..."
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.description
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Thumbnail URL with live preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thumbnail Image URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className={`flex-1 px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  errors.thumbnail
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailPreview('')}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
            {errors.thumbnail && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.thumbnail}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'add' ? 'Create Product' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
