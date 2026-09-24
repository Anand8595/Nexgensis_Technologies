import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Breadcrumb from '../components/common/Breadcrumb';
import ReviewList from '../components/reviews/ReviewList';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmModal from '../components/common/ConfirmModal';

import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import {
  formatCurrency,
  getRatingBadgeClass,
  getStockStatus,
} from '../utils/formatters';

import {
  ArrowLeft,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Tag,
  Edit3,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setIsNotFound(false);
    setErrorMessage('');

    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      const mainImg = data.thumbnail || (data.images && data.images[0]) || '';
      setSelectedImage(mainImg);
    } catch (err) {
      if (err.status === 404 || err.response?.status === 404) {
        setIsNotFound(true);
      } else {
        setErrorMessage(
          err.userMessage || 'Failed to fetch product details. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    productService
      .getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, [fetchProduct]);

  const handleEditSubmit = async (formData) => {
    setIsSubmittingEdit(true);
    try {
      const updated = await productService.updateProduct(id, formData);
      setProduct(updated);
      setIsEditModalOpen(false);
      showToast(`Product "${updated.title}" successfully updated!`, 'success');
    } catch (err) {
      showToast(err.userMessage || 'Failed to update product.', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(id);
      showToast('Product has been deleted.', 'success');
      navigate('/products', { replace: true });
    } catch (err) {
      showToast(err.userMessage || 'Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Not Found State (required by prompt: "Show a not found page for a wrong id")
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Not Found
          </h1>
          <p className="mt-3 text-slate-600 max-w-md mx-auto">
            The product with ID <span className="font-mono font-bold text-slate-800">"{id}"</span> could not be found. It may have been deleted or never existed.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: 'Products', to: '/products' },
              { label: isLoading ? 'Loading...' : product?.title || 'Details' },
            ]}
          />

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-square bg-slate-200 rounded-2xl w-full"></div>
              <div className="flex gap-2">
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-24 bg-slate-100 rounded-xl"></div>
              <div className="h-10 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold">{errorMessage}</p>
            <button
              onClick={fetchProduct}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : product ? (
          <div className="space-y-8">
            {/* Main Product Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Main Large Image */}
                  <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center relative group">
                    <img
                      src={selectedImage || product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        -{product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image Thumbnails Strip */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 shrink-0 transition-all ${
                            selectedImage === img
                              ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Product Information & Controls */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Category & Rating Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                        {product.category}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getRatingBadgeClass(
                          product.rating
                        )}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{Number(product.rating || 0).toFixed(1)} / 5</span>
                      </span>

                      {product.brand && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{product.brand}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {product.title}
                    </h1>

                    {/* Price & Savings */}
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>

                      {product.discountPercentage > 0 && (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Save {product.discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Description
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Inventory & Stock status */}
                    <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Inventory Availability</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              getStockStatus(product.stock).dotClass
                            }`}
                          ></span>
                          <span className="text-sm font-bold text-slate-800">
                            {getStockStatus(product.stock).label}
                          </span>
                        </div>
                      </div>

                      {product.sku && (
                        <div className="border-l border-slate-200 pl-4">
                          <div className="text-xs text-slate-500 font-medium">SKU</div>
                          <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                            {product.sku}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Specs & Assurance Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Shipping</span>
                          <span className="text-slate-500">{product.shippingInformation || 'Standard Delivery'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Warranty</span>
                          <span className="text-slate-500">{product.warrantyInformation || 'Standard Warranty'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2.5">
                        <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Returns</span>
                          <span className="text-slate-500">{product.returnPolicy || '30 Days Return'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors border border-slate-200"
                    >
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>Edit Product</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold transition-colors border border-rose-200"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Delete Product</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Verified Customer Reviews
              </h2>
              <ReviewList reviews={product.reviews || []} />
            </div>
          </div>
        ) : null}
      </main>

      {/* Edit Product Modal */}
      {product && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          mode="edit"
          product={product}
          categories={categories}
          onSubmit={handleEditSubmit}
          onClose={() => setIsEditModalOpen(false)}
          isSubmitting={isSubmittingEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {product && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Product"
          message={`Are you sure you want to permanently delete "${product.title}"?`}
          confirmLabel="Delete Now"
          isConfirming={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
