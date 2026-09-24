# NexStore - Product Admin Dashboard

A modern, high-performance product inventory admin dashboard built with **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

Designed with a sleek, responsive UI (desktop table and mobile card layout), robust client-side state architecture, URL synchronization, and comprehensive resilience against race conditions, network latency, and mock API limitations.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [Your Public GitHub Repository Link]
- **Live Deployment**: [Your Live Vercel/Netlify Link]

---

## 🛠️ Tech Stack & Architecture
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & Inter typography
- **HTTP Client**: Axios with centralized request & response interceptors
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)
- **State & Data Fetching**: Custom hooks (`useProducts`, `useDebounce`) without external data-fetching libraries (No React Query / SWR / external pagination libraries, as per requirements)

---

## 📋 Features Completed

### 1. Authentication & Route Protection
- **Login Flow (`/login`)**: Authenticates via `POST /auth/login` using credentials:
  - **Username**: `emilys`
  - **Password**: `emilyspass`
- **Error Handling**: Displays informative inline alerts on invalid credentials or network errors.
- **Demo Quick-Fill**: One-click autofill button to quickly test both valid and invalid logins.
- **Route Guard (`ProtectedRoute`)**: Unauthenticated users are redirected to `/login`, preserving intended navigation state (`location.state.from`).
- **Logout Action**: Securely clears credentials from `localStorage`, cancels active requests, and redirects to login.

### 2. Product List & Responsive Layout
- **Desktop View**: Rich data table displaying product thumbnail, title, brand, SKU, category pill, formatted price with discount badge, star rating, stock level indicator, and quick actions.
- **Mobile View**: Touch-optimized card grid presenting identical product details with clean hierarchy.
- **Stock Badges**: Dynamic status indicators (`In Stock`, `Low Stock (<=10)`, `Out of Stock`).

### 3. Server-Side Pagination
- Implements `limit` and `skip` query parameters against the DummyJSON API.
- Intuitive pagination bar displaying:
  - `"Showing X–Y of Z products"`
  - Page size selector (`10`, `20`, `50` items per page)
  - Previous and Next buttons (with disabled boundary states)
  - Numbered page buttons with smart ellipsis windowing (`1 ... 4 5 6 ... 20`)

### 4. Search with Debounce & Race-Condition Safety
- Endpoint: `/products/search?q=`
- **Debounced Input**: Waits 400ms after user stops typing before triggering the network request.
- **Automatic Reset**: Switching or typing search query automatically resets view to page 1.
- **Race Condition Prevention**: Employs `AbortController` and an incremental `requestId` counter to abort superseded requests and guarantee that older responses (even with artificial 2-second delays) can never overwrite fresh results.

### 5. Filtering & Sorting
- **Category Filter**: Dynamically populated from `/products/categories`.
- **Sorting**: Multi-field sorting by Price (Low/High), Rating, Title (A-Z/Z-A), and Stock level.
- **Clear Filters Button**: One-click button to reset all active filters.

### 6. Product Details (`/products/:id`)
- Deep-linked detail view with interactive image gallery and thumbnail selector.
- Detailed specifications: Price, savings discount, inventory status, SKU, shipping, warranty, and return policy.
- Verified customer reviews section with reviewer names, star ratings, and dates.
- **404 Not Found Page**: Friendly "Product Not Found" screen when navigating to a non-existent or deleted ID (`/products/999999`).

### 7. Add, Edit & Delete Management
- **Add / Edit Modal**: Comprehensive modal with live field validation (Title min 3 chars, category required, positive price, non-negative integer stock, description min 10 chars, valid image URL with live preview).
- **Delete Confirmation Modal**: Alert modal requiring explicit confirmation before removing an item.
- **Double-Submit Prevention**: Buttons are disabled and guarded by synchronous `submitLockRef` locks to prevent duplicate submissions from rapid clicking.

### 8. Loading, Empty & Error States
- **Loading**: Skeleton pulse loaders for both table rows (desktop) and cards (mobile).
- **Empty State**: Clear empty message with "Reset Filters" and "Add New Product" quick buttons.
- **Error State**: Friendly error message with an interactive "Retry" button.

---

## 💡 Key Architectural Decisions & Edge Case Solutions

### 1. Handling the Search & Category Filter Conflict
- **Problem**: DummyJSON provides `/products/search?q=` and `/products/category/{category}`, but the server API does not allow combining search and category filters simultaneously.
- **Decision & Solution**: When both a category and a search term are present, our `productService` requests the products for the selected category (`/products/category/{category}`) and applies an in-memory search index across the title, description, and brand attributes. The filtered collection is then paginated. We also display a subtle informational badge notifying the user that client-side category indexing is active.

### 2. Mock API Mutation Persistence (`localOverlayService`)
- **Problem**: DummyJSON is a mock API. `POST /products/add`, `PUT /products/:id`, and `DELETE /products/:id` return simulated responses, but subsequent `GET /products` calls do not persist the changes.
- **Decision & Solution**: We built a lightweight client-side overlay layer (`src/services/localOverlayService.js`). When a product is created, edited, or deleted:
  - The real DummyJSON endpoint is invoked first to ensure valid API contract execution.
  - The resulting object / ID is persisted to local storage overlay keys (`added`, `modified`, `deleted`).
  - When fetching product lists or details, the overlay automatically merges added items, overrides modified fields, and filters out deleted IDs.
  - We also included a convenient **"Reset Mock Edits"** button in the header so reviewers can revert to pristine API data at any time.

### 3. Race Condition Elimination (Fast Typing & Delayed Network)
- **Problem**: If network responses arrive out of order (e.g., typing fast when latency is high or `&delay=2000` is active), a slow earlier request could overwrite a later request.
- **Decision & Solution**:
  1. Each request creates an `AbortController` stored in `abortControllerRef`. Starting a new request immediately cancels in-flight network requests via `controller.abort()`.
  2. Each request increments a monotonic `requestIdRef`. Only responses matching `currentRequestId === requestIdRef.current` are allowed to commit state changes.
  3. We added a built-in **"Test Latency (2s)"** toggle button in the filters bar that appends `&delay=2000` to demonstrate that fast typing never produces stale results.

### 4. URL State Synchronization & Tampering Defense
- **Requirement**: Keep page, search, filter, and sort values in the URL so refreshing or sharing links yields identical results. Malformed values (e.g. `?page=abc` or `?page=999`) must not break the page.
- **Solution**:
  - `parseProductQueryParams()` validates every query parameter defensively:
    - Non-numeric or negative page numbers default to `1`.
    - Page size is clamped strictly to `[10, 20, 50]`.
    - Out-of-bounds page requests (`page > totalPages`) automatically clamp to the last valid page once total count is loaded.
    - Deep links like `http://localhost:5174/products?page=2&search=phone&limit=20` work seamlessly on fresh reload.

### 5. Shared Axios Setup (`src/api/axiosInstance.js`)
- Request interceptor automatically attaches `Authorization: Bearer <token>` from local storage.
- Response interceptor normalizes error messages and catches `401 Unauthorized` responses to clear invalid sessions and redirect to login.

---

## 🧗 One Problem Faced & How It Was Solved

### The Problem:
When implementing the mock mutation overlay for DummyJSON, newly added products had numeric IDs (e.g., `id: 195`), while existing DummyJSON product IDs span `1` to `194`. When a user edited a newly added product or attempted to view its detail page (`/products/195`), DummyJSON's server returned a `404 Not Found` because the server database never actually saved the simulated product.

### The Solution:
In `productService.getProductById(id)`:
1. The service first inspects `localOverlayService.getAddedProducts()` for the matching ID.
2. If found locally, it immediately returns the simulated product without hitting the server 404 endpoint.
3. If not found locally, it queries `GET /products/{id}`. If the item was previously deleted by the user, the overlay intercepts it and throws a clean 404 error.
4. For updates, `localOverlayService.updateCustomProduct(id, data)` checks whether the item is in the `addedProducts` list or is an existing API product, ensuring updates to both mock-added and existing products persist across route transitions and page refreshes.

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

# 3. Start development server
npm run dev
```

The application will be accessible at: `http://localhost:5174/` (or port specified in terminal).

### Available Scripts
- `npm run dev`: Starts local Vite development server with HMR.
- `npm run build`: Generates optimized production bundle in `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to verify code quality.

---

## 🌐 Deployment Instructions (Vercel / Netlify)

### Deploying to Vercel:
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the Root Directory to `admin-dashboard` (if nested) or `./`.
5. Framework Preset: **Vite**.
6. Build Command: `npm run build`.
7. Output Directory: `dist`.
8. Click **Deploy**.

> **Note on Client-Side Routing (SPA)**: A `vercel.json` file is included with rewrite rules ensuring all deep links (e.g. `/products/1`) resolve to `index.html`.

---

## 📄 License
This project was developed for the Frontend Assignment: Product Admin Dashboard.
#   N e x g e n s i s _ T e c h n o l o g i e s  
 