# NexStore - Product Admin Dashboard

A modern, high-performance product inventory admin dashboard built with **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

Designed with a sleek, responsive UI (desktop table and mobile card layout), robust client-side state architecture, URL synchronization, and comprehensive resilience against race conditions, network latency, and mock API limitations.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [Your Public GitHub Repository Link]
- **Live Deployment**: [Your Live Vercel/Netlify Link]

---

## 🛠️ Tech Stack & Architecture
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & Inter typography
- **HTTP Client**: Axios with centralized request and response interceptors
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)
- **State & Data Fetching**: Custom hooks (`useProducts`, `useDebounce`) without external data-fetching libraries (pure vanilla React state, adhering to project constraints)

---

## 📋 Features Completed

### 1. Authentication & Route Protection
- **Login Flow (`/login`)**: Authenticates via `POST /auth/login` using credentials:
  - **Username**: `emilys`
  - **Password**: `emilyspass`
- **Error Handling**: Displays informative inline alerts on invalid credentials or network errors.
- **Demo Quick-Fill**: One-click autofill button to quickly test valid and invalid logins.
- **Route Guard (`ProtectedRoute`)**: Unauthenticated users are redirected to `/login`, preserving intended navigation state (`location.state.from`).
- **Logout Action**: Securely clears credentials from `localStorage`, cancels active requests, and redirects to the login view.

### 2. Product List & Responsive Layout
- **Desktop View**: Rich data table displaying product thumbnail, title, brand, SKU, category pill, formatted price with discount badge, star rating, stock level indicator, and quick action controls.
- **Mobile View**: Touch-optimized card grid presenting identical product details with a clean visual hierarchy.
- **Stock Badges**: Dynamic status indicators (`In Stock`, `Low Stock (<=10)`, `Out of Stock`).

### 3. Server-Side Pagination
- Implements `limit` and `skip` query parameters against the DummyJSON API.
- Intuitive pagination bar displaying:
  - `"Showing X–Y of Z products"`
  - Page size selector (`10`, `20`, `50` items per page)
  - Previous and Next buttons with disabled boundary states
  - Numbered page buttons with smart ellipsis windowing (`1 ... 4 5 6 ... 20`)

### 4. Search with Debounce & Race-Condition Safety
- **Endpoint**: `/products/search?q=`
- **Debounced Input**: Waits 400ms after the user stops typing before triggering the network request.
- **Automatic Reset**: Updating the search query automatically resets pagination to page 1.
- **Race Condition Prevention**: Employs `AbortController` and an incremental `requestId` counter to abort superseded requests, ensuring earlier, slower responses never overwrite fresh search results.

### 5. Filtering & Sorting
- **Category Filter**: Dynamically populated from `/products/categories`.
- **Sorting**: Multi-field sorting by Price (Low/High), Rating, Title (A–Z / Z–A), and Stock level.
- **Clear Filters Button**: One-click action to reset all active filters simultaneously.

### 6. Product Details (`/products/:id`)
- Deep-linked detail view with an interactive image gallery and thumbnail selector.
- Detailed specifications: price, savings discount, inventory status, SKU, shipping, warranty, and return policy.
- Verified customer reviews section with reviewer names, star ratings, and review dates.
- **404 Not Found Page**: Friendly fallback screen when navigating to a non-existent or deleted ID (`/products/999999`).

### 7. Add, Edit & Delete Management
- **Add / Edit Modal**: Interactive modal with live field validation (Title min 3 chars, category required, positive price, non-negative integer stock, description min 10 chars, valid image URL preview).
- **Delete Confirmation Modal**: Alert modal requiring explicit confirmation before removing an item.
- **Double-Submit Prevention**: Submission buttons are disabled and guarded by synchronous `submitLockRef` locks to prevent duplicate submissions from rapid clicks.

### 8. Loading, Empty & Error States
- **Loading State**: Skeleton pulse loaders tailored for both table rows (desktop) and cards (mobile).
- **Empty State**: Clear empty message with quick actions to "Reset Filters" or "Add New Product".
- **Error State**: User-friendly error message with an interactive "Retry" button.

---

## 💡 Key Architectural Decisions & Edge Case Solutions

### 1. Search & Category Filter Conflict
- **Problem**: DummyJSON provides `/products/search?q=` and `/products/category/{category}`, but its server API does not allow combining search and category filters simultaneously.
- **Decision & Solution**: When both a category and a search term are present, `productService` fetches the items for the selected category (`/products/category/{category}`) and applies an in-memory search index across the title, description, and brand attributes. The filtered collection is then paginated on the client. A subtle UI badge informs the user that category-scoped search indexing is active.

### 2. Mock API Mutation Persistence (`localOverlayService`)
- **Problem**: DummyJSON is a mock API. `POST /products/add`, `PUT /products/:id`, and `DELETE /products/:id` return simulated responses, but subsequent `GET /products` calls do not persist the modifications.
- **Decision & Solution**: Implemented a client-side overlay layer (`src/services/localOverlayService.js`). When a product is created, edited, or deleted:
  - The actual DummyJSON endpoint is invoked first to validate API contracts.
  - The resulting object or ID is persisted to local storage overlay sets (`added`, `modified`, `deleted`).
  - When fetching product lists or details, the overlay merges added items, overrides modified fields, and excludes deleted IDs.
  - A **"Reset Mock Edits"** button in the header allows reviewers to revert back to pristine API data at any point.

### 3. Race Condition Elimination
- **Problem**: If network responses arrive out of order (such as under unstable network latency or when testing simulated delays), slow earlier requests could overwrite newer user input.
- **Decision & Solution**:
  1. Each request initializes an `AbortController` stored in `abortControllerRef`. Initiating a new request immediately invokes `controller.abort()` on any in-flight request.
  2. Each request increments a monotonic `requestIdRef`. Only responses matching `currentRequestId === requestIdRef.current` can commit to state.
  3. A built-in **"Test Latency (2s)"** toggle appends `&delay=2000` to DummyJSON requests to verify that rapid filtering and typing remain race-condition safe.

### 4. URL State Synchronization & Tampering Defense
- **Requirement**: Maintain active page, search query, filter, and sort values in the URL so refreshing or sharing links preserves application state. Malformed query parameters (e.g., `?page=abc` or `?page=999`) must fail gracefully.
- **Solution**:
  - `parseProductQueryParams()` validates every query parameter defensively:
    - Non-numeric or negative page numbers default to `1`.
    - Page sizes outside `[10, 20, 50]` clamp to the closest supported option.
    - Out-of-bounds page requests (`page > totalPages`) clamp to the last valid page once total count resolves.
    - Deep links like `/products?page=2&search=phone&limit=20` resolve consistently on cold reloads.

### 5. Centralized Axios Setup (`src/api/axiosInstance.js`)
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` from local storage to outgoing requests.
- **Response Interceptor**: Normalizes error messages and catches `401 Unauthorized` responses to flush invalid sessions and redirect to `/login`.

---

## 🧗 Problem Solved: Mock ID Collisions & 404s

### The Challenge
When implementing the mock mutation overlay for DummyJSON, newly created items received simulated IDs (e.g., `id: 195`), while native DummyJSON product IDs span `1` to `194`. When a user attempted to view or edit the detail page of a newly added product (`/products/195`), DummyJSON returned a `404 Not Found` because the record did not exist in their remote database.

### The Solution
Inside `productService.getProductById(id)`:
1. The service first queries `localOverlayService.getAddedProducts()` for the matching ID.
2. If located locally, it immediately returns the simulated product without triggering a remote request.
3. If not found locally, it issues `GET /products/{id}`. If the item was previously marked deleted in the overlay, it intercepts the response and yields a clean 404 state.
4. For updates, `localOverlayService.updateCustomProduct(id, data)` determines whether the target is a locally added item or an existing remote product, ensuring edits to both persist across route transitions and refreshes.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd admin-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

---

## 📄 License
This project was developed for the Frontend Assignment: Product Admin Dashboard.
#   N e x g e n s i s _ T e c h n o l o g i e s 
 
 
