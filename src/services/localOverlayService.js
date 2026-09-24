// Service to maintain an optimistic/persistent client overlay for mock API mutations.
// Since DummyJSON's POST/PUT/DELETE endpoints simulate mutations but do not persist them
// to their backend database, this overlay ensures added, edited, and deleted products
// persist across page navigations, reloads, and pagination.

const STORAGE_KEY_ADDED = 'nexstore_overlay_added';
const STORAGE_KEY_MODIFIED = 'nexstore_overlay_modified';
const STORAGE_KEY_DELETED = 'nexstore_overlay_deleted';

export const localOverlayService = {
  getAddedProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ADDED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomProduct(product) {
    const existing = this.getAddedProducts();
    const updated = [product, ...existing.filter((p) => p.id !== product.id)];
    localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(updated));
    return product;
  },

  getModifiedProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MODIFIED);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  updateCustomProduct(id, productData) {
    const numId = Number(id);
    const added = this.getAddedProducts();
    const addedIndex = added.findIndex((p) => Number(p.id) === numId);

    if (addedIndex !== -1) {
      // If it's an added product, update it in addedProducts
      added[addedIndex] = { ...added[addedIndex], ...productData };
      localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(added));
      return added[addedIndex];
    }

    // Otherwise record in modifiedProducts map
    const modified = this.getModifiedProducts();
    modified[numId] = { ...(modified[numId] || {}), ...productData, id: numId };
    localStorage.setItem(STORAGE_KEY_MODIFIED, JSON.stringify(modified));
    return modified[numId];
  },

  getDeletedProductIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DELETED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  deleteProduct(id) {
    const numId = Number(id);
    // Remove from added if present
    const added = this.getAddedProducts().filter((p) => Number(p.id) !== numId);
    localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(added));

    // Remove from modified if present
    const modified = this.getModifiedProducts();
    delete modified[numId];
    localStorage.setItem(STORAGE_KEY_MODIFIED, JSON.stringify(modified));

    // Record in deleted IDs
    const deleted = this.getDeletedProductIds();
    if (!deleted.includes(numId)) {
      deleted.push(numId);
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deleted));
    }
  },

  applyOverlayToProduct(product) {
    if (!product) return null;
    const numId = Number(product.id);
    const deleted = this.getDeletedProductIds();
    if (deleted.includes(numId)) {
      return null;
    }
    const modified = this.getModifiedProducts();
    if (modified[numId]) {
      return { ...product, ...modified[numId] };
    }
    return product;
  },

  applyOverlayToProductList(apiProducts, totalCount) {
    const deleted = this.getDeletedProductIds();
    const modified = this.getModifiedProducts();
    const added = this.getAddedProducts();

    // Filter out deleted products from API response
    let filtered = apiProducts
      .filter((p) => !deleted.includes(Number(p.id)))
      .map((p) => {
        const numId = Number(p.id);
        return modified[numId] ? { ...p, ...modified[numId] } : p;
      });

    // Compute updated total count
    const adjustedTotal = Math.max(0, totalCount + added.length - deleted.length);

    return {
      products: filtered,
      total: adjustedTotal,
    };
  },

  resetOverlay() {
    localStorage.removeItem(STORAGE_KEY_ADDED);
    localStorage.removeItem(STORAGE_KEY_MODIFIED);
    localStorage.removeItem(STORAGE_KEY_DELETED);
  },
};
