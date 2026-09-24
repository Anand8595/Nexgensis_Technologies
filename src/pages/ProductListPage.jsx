import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductFilters from '../components/products/ProductFilters';
import ProductTable from '../components/products/ProductTable';
import ProductCardGrid from '../components/products/ProductCardGrid';
import Pagination from '../components/common/Pagination';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmModal from '../components/common/ConfirmModal';

import { useProducts } from '../hooks/useProducts';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import {
  parseProductQueryParams,
  serializeProductQueryParams,
} from '../utils/urlParams';
import {
  Plus,
  Package,
  Layers,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // 1. Parse current URL query params defensively
  const queryParams = useMemo(
    () => parseProductQueryParams(searchParams),
    [searchParams]
  );

  // 2. Fetch categories list once on mount
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch products via custom hook (manages race conditions, AbortController, overlay)
  const {
    products,
    total,
    isLoading,
    error,
    isCombinedFilter,
    refetch,
  } = useProducts(queryParams);

  // 4. Modal state management
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    product: null,
  });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // 5. Delete confirmation modal state
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    product: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // 6. Handle URL query updates
  const updateUrlParams = useCallback(
    (newPartialParams) => {
      const merged = {
        ...queryParams,
        ...newPartialParams,
      };

      const serialized = serializeProductQueryParams(merged);
      setSearchParams(serialized, { replace: true });
    },
    [queryParams, setSearchParams]
  );

  // Guard against out-of-bounds page (e.g. ?page=9999)
  useEffect(() => {
    if (!isLoading && total > 0) {
      const maxPages = Math.ceil(total / queryParams.limit);
      if (queryParams.page > maxPages) {
        updateUrlParams({ page: maxPages });
      }
    }
  }, [isLoading, total, queryParams.page, queryParams.limit, updateUrlParams]);

  // Handlers for Add / Edit
  const handleOpenAddModal = () => {
    setModalConfig({
      isOpen: true,
      mode: 'add',
      product: null,
    });
  };

  const handleOpenEditModal = (product) => {
    setModalConfig({
      isOpen: true,
      mode: 'edit',
      product,
    });
  };

  const handleCloseModal = () => {
    if (!isSubmittingForm) {
      setModalConfig({ isOpen: false, mode: 'add', product: null });
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmittingForm(true);
    try {
      if (modalConfig.mode === 'add') {
        const created = await productService.addProduct(formData);
        showToast(`Product "${created.title}" was successfully created!`, 'success');
        handleCloseModal();
        refetch();
      } else {
        const updated = await productService.updateProduct(
          modalConfig.product.id,
          formData
        );
        showToast(`Product "${updated.title}" was successfully updated!`, 'success');
        handleCloseModal();
        refetch();
      }
    } catch (err) {
      showToast(
        err.userMessage || 'Failed to save product. Please try again.',
        'error'
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteModal = (product) => {
    setDeleteConfig({
      isOpen: true,
      product,
    });
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteConfig({ isOpen: false, product: null });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig.product) return;

    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteConfig.product.id);
      showToast(
        `Product "${deleteConfig.product.title}" has been removed.`,
        'success'
      );
      handleCloseDeleteModal();
      refetch();
    } catch (err) {
      showToast(
        err.userMessage || 'Failed to delete product. Please try again.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate quick metrics for KPI banner
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navbar */}
      <Navbar onResetData={refetch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'Products Inventory' }]} />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Products Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View, search, filter, and modify items across your entire inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Total Items</div>
              <div className="text-lg font-bold text-slate-900">{total}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Low Stock on Page</div>
              <div className="text-lg font-bold text-amber-600">{lowStockCount}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Categories</div>
              <div className="text-lg font-bold text-slate-900">{categories.length || '...'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Active View</div>
              <div className="text-xs font-bold text-emerald-700 capitalize truncate max-w-[110px]">
                {queryParams.category || 'All Items'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <ProductFilters
          search={queryParams.search}
          category={queryParams.category}
          sortBy={queryParams.sortBy}
          order={queryParams.order}
          delay={queryParams.delay}
          categories={categories}
          isCombinedFilter={isCombinedFilter}
          onFilterChange={updateUrlParams}
        />

        {/* Main Content Area: Loading / Error / Empty / Data */}
        <div className="space-y-4">
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : isLoading ? (
            <>
              {/* Desktop Skeleton */}
              <div className="hidden md:block">
                <TableSkeleton rows={queryParams.limit > 10 ? 10 : queryParams.limit} />
              </div>
              {/* Mobile Skeleton */}
              <div className="block md:hidden">
                <CardSkeleton count={4} />
              </div>
            </>
          ) : products.length === 0 ? (
            <EmptyState
              title={
                queryParams.search
                  ? `No products found for "${queryParams.search}"`
                  : 'No products in this category'
              }
              message="Try adjusting your search criteria, clearing active filters, or adding a new product."
              onResetFilters={() =>
                updateUrlParams({
                  search: '',
                  category: '',
                  sortBy: '',
                  order: 'asc',
                  page: 1,
                })
              }
              onAddNew={handleOpenAddModal}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ProductTable
                  products={products}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              </div>

              {/* Mobile Cards View */}
              <div className="block md:hidden">
                <ProductCardGrid
                  products={products}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              </div>

              {/* Pagination Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4">
                <Pagination
                  currentPage={queryParams.page}
                  totalItems={total}
                  pageSize={queryParams.limit}
                  onPageChange={(newPage) => updateUrlParams({ page: newPage })}
                  onPageSizeChange={(newSize) =>
                    updateUrlParams({ limit: newSize, page: 1 })
                  }
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        product={modalConfig.product}
        categories={categories}
        onSubmit={handleFormSubmit}
        onClose={handleCloseModal}
        isSubmitting={isSubmittingForm}
      />

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfig.isOpen}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteConfig.product?.title || 'this product'}" from inventory? This action will remove it from the catalog.`}
        confirmLabel="Confirm Delete"
        cancelLabel="Keep Product"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
}
