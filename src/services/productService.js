import axiosInstance from '../api/axiosInstance';
import { localOverlayService } from './localOverlayService';

export const productService = {
  /**
   * Fetch all categories
   * Normalizes category response into { slug, name } array
   */
  async getCategories() {
    const response = await axiosInstance.get('/products/categories');
    const data = response.data;

    // DummyJSON returns array of objects { slug, name, url } or strings
    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === 'string') {
          return {
            slug: item,
            name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '),
          };
        }
        return {
          slug: item.slug,
          name: item.name || item.slug.charAt(0).toUpperCase() + item.slug.slice(1).replace(/-/g, ' '),
        };
      });
    }
    return [];
  },

  /**
   * Fetch paginated products with optional sort, search, category, and delay
   * Gracefully manages DummyJSON API's limitation regarding search + category filter.
   */
  async fetchProducts({
    page = 1,
    limit = 10,
    search = '',
    category = '',
    sortBy = '',
    order = 'asc',
    delay = 0,
    signal,
  } = {}) {
    const validLimit = Math.max(1, Number(limit) || 10);
    const validPage = Math.max(1, Number(page) || 1);
    const skip = (validPage - 1) * validLimit;

    const params = {
      limit: validLimit,
      skip,
    };

    if (sortBy) {
      params.sortBy = sortBy;
      params.order = order || 'asc';
    }

    if (delay > 0) {
      params.delay = delay;
    }

    let url = '/products';
    const trimmedSearch = search.trim();

    // CASE 1: Both Category AND Search are selected
    // Note: DummyJSON doesn't support combined search and category endpoints.
    // Solution: Fetch all products for the category, then filter by search term in memory.
    if (category && trimmedSearch) {
      const catResponse = await axiosInstance.get(
        `/products/category/${encodeURIComponent(category)}`,
        {
          params: {
            limit: 100, // Fetch category pool
            delay: delay > 0 ? delay : undefined,
          },
          signal,
        }
      );

      let filtered = (catResponse.data.products || []).filter((item) => {
        const query = trimmedSearch.toLowerCase();
        return (
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query)
        );
      });

      // Apply sorting if requested
      if (sortBy) {
        filtered.sort((a, b) => {
          let valA = a[sortBy];
          let valB = b[sortBy];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply local overlay
      const overlayResult = localOverlayService.applyOverlayToProductList(
        filtered,
        filtered.length
      );

      // Paginate client-side
      const paginated = overlayResult.products.slice(skip, skip + validLimit);

      return {
        products: paginated,
        total: overlayResult.products.length,
        skip,
        limit: validLimit,
        isCombinedFilter: true,
      };
    }

    // CASE 2: Category Filter only
    if (category) {
      url = `/products/category/${encodeURIComponent(category)}`;
    }
    // CASE 3: Search Query only
    else if (trimmedSearch) {
      url = '/products/search';
      params.q = trimmedSearch;
    }

    // Call DummyJSON
    const response = await axiosInstance.get(url, { params, signal });
    const rawData = response.data;

    // Apply local overlay to reflect custom added, edited, or deleted items
    const overlayResult = localOverlayService.applyOverlayToProductList(
      rawData.products || [],
      rawData.total || 0
    );

    // If first page and no search/category, prepend custom added items
    let finalProducts = overlayResult.products;
    if (validPage === 1 && !category && !trimmedSearch) {
      const added = localOverlayService.getAddedProducts();
      if (added.length > 0) {
        // Prepend added products avoiding duplicates
        const existingIds = new Set(finalProducts.map((p) => p.id));
        const novelAdded = added.filter((p) => !existingIds.has(p.id));
        finalProducts = [...novelAdded, ...finalProducts].slice(0, validLimit);
      }
    }

    return {
      products: finalProducts,
      total: overlayResult.total,
      skip: rawData.skip || skip,
      limit: validLimit,
      isCombinedFilter: false,
    };
  },

  /**
   * Fetch product details by ID
   */
  async getProductById(id, { delay = 0, signal } = {}) {
    const numId = Number(id);

    // Check if it was an added product stored locally
    const addedList = localOverlayService.getAddedProducts();
    const localFound = addedList.find((p) => Number(p.id) === numId);
    if (localFound) {
      return localOverlayService.applyOverlayToProduct(localFound);
    }

    // Check if deleted
    const deleted = localOverlayService.getDeletedProductIds();
    if (deleted.includes(numId)) {
      const error = new Error('Product not found (deleted).');
      error.status = 404;
      error.userMessage = "Product with id '" + id + "' not found";
      throw error;
    }

    const params = {};
    if (delay > 0) params.delay = delay;

    const response = await axiosInstance.get(`/products/${id}`, { params, signal });
    return localOverlayService.applyOverlayToProduct(response.data);
  },

  /**
   * Add a new product (POST /products/add)
   * Also registers in localOverlayService so it appears in the dashboard
   */
  async addProduct(productData) {
    const response = await axiosInstance.post('/products/add', productData);
    const createdProduct = {
      ...response.data,
      // Provide default fallback fields if not in response
      id: response.data.id || Date.now(),
      rating: Number(productData.rating) || 4.5,
      stock: Number(productData.stock) || 10,
      price: Number(productData.price) || 0,
      images: productData.thumbnail ? [productData.thumbnail] : [],
      thumbnail:
        productData.thumbnail ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60',
      reviews: [],
    };

    localOverlayService.addCustomProduct(createdProduct);
    return createdProduct;
  },

  /**
   * Update an existing product (PUT /products/:id)
   * Persists changes to localOverlayService
   */
  async updateProduct(id, productData) {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    const updated = {
      ...response.data,
      id: Number(id),
      price: Number(productData.price ?? response.data.price),
      stock: Number(productData.stock ?? response.data.stock),
      rating: Number(productData.rating ?? response.data.rating),
    };

    localOverlayService.updateCustomProduct(id, updated);
    return updated;
  },

  /**
   * Delete a product (DELETE /products/:id)
   * Records deletion in localOverlayService
   */
  async deleteProduct(id) {
    const response = await axiosInstance.delete(`/products/${id}`);
    localOverlayService.deleteProduct(id);
    return response.data;
  },
};
