# NexStore — Product Admin Dashboard

A modern, responsive, and high-performance product inventory admin dashboard built with **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

NexStore provides a complete product-management experience with authentication, server-side pagination, debounced search, filtering, sorting, product CRUD operations, URL state synchronization, responsive layouts, and client-side persistence for DummyJSON's simulated mutations.

---

## 🚀 Live Demo & Repository

* **GitHub Repository:** [Your GitHub Repository Link]
* **Live Demo:** [Your Vercel/Netlify Deployment Link]

---

## 🛠️ Tech Stack

| Technology          | Purpose                                   |
| ------------------- | ----------------------------------------- |
| React 19            | Frontend UI                               |
| Vite                | Development and build tool                |
| Tailwind CSS v4     | Styling and responsive design             |
| Axios               | HTTP requests and API communication       |
| React Router DOM v7 | Routing and protected routes              |
| Lucide React        | Icons                                     |
| DummyJSON API       | Product and authentication API            |
| LocalStorage        | Authentication and local mutation overlay |

### Architecture

The application uses a modular architecture based on:

* React functional components
* Custom hooks
* Service-layer API abstraction
* Centralized Axios configuration
* LocalStorage-based persistence
* URL query-state synchronization
* AbortController-based request cancellation

No external data-fetching or state-management library is used. Data fetching and state management are implemented using native React state and custom hooks.

---

# 📋 Features

## 1. Authentication & Route Protection

### Login Flow

The application provides a dedicated login page at:

```text
/login
```

Authentication is performed using DummyJSON's login endpoint:

```text
POST /auth/login
```

### Demo Credentials

```text
Username: emilys
Password: emilyspass
```

### Authentication Features

* Login using DummyJSON authentication
* Inline validation and error messages
* Network error handling
* Demo quick-fill functionality
* Authentication state stored in `localStorage`
* Protected routes using `ProtectedRoute`
* Automatic redirection to `/login` for unauthenticated users
* Preservation of the originally requested route
* Logout functionality
* Active request cancellation during logout

---

# 2. Product List & Responsive UI

The main product dashboard provides a responsive product-management interface.

### Desktop View

The desktop table displays:

* Product thumbnail
* Product title
* Brand
* SKU
* Category
* Price
* Discount percentage
* Rating
* Stock
* Product actions

### Mobile View

On smaller screens, products are displayed as responsive cards containing the same important product information.

### Stock Status

Products are automatically categorized into:

* **In Stock**
* **Low Stock** — stock `<= 10`
* **Out of Stock** — stock `0`

---

# 3. Server-Side Pagination

Product pagination uses DummyJSON's:

```text
limit
skip
```

query parameters.

The pagination interface includes:

* Current result range
* Total product count
* Page size selection
* `10`, `20`, and `50` products per page
* Previous button
* Next button
* Numbered pages
* Smart ellipsis handling

Example:

```text
1 ... 4 5 6 ... 20
```

The pagination state is also synchronized with the URL.

---

# 4. Search with Debouncing

Product search uses:

```text
/products/search?q=
```

### Debounced Search

The search input waits **400ms** after the user stops typing before sending a request.

This reduces unnecessary API calls while typing.

### Search Behavior

* Search requests are debounced
* Pagination resets to page 1 after a search
* Search state is synchronized with the URL
* Previous requests are cancelled when a new request starts
* Older responses cannot overwrite newer results

---

# 5. Race-Condition Protection

The application is designed to handle slow or out-of-order network responses.

Two mechanisms are used:

### AbortController

Each active request receives an `AbortController`.

When a new request starts:

```text
Previous request → aborted
New request → started
```

### Request ID

A monotonic request ID is also maintained.

Only the latest request is allowed to update application state.

This protects the UI from situations where:

```text
Request A → slow response
Request B → fast response
```

Without protection, Request A could incorrectly overwrite the results from Request B.

### Latency Testing

The application includes a:

```text
Test Latency (2s)
```

option that adds an artificial delay to requests for testing race-condition handling.

---

# 6. Filtering & Sorting

## Category Filter

Categories are dynamically retrieved from:

```text
/products/categories
```

Users can filter products by category.

## Sorting

The dashboard supports sorting by:

* Price — Low to High
* Price — High to Low
* Rating
* Title — A to Z
* Title — Z to A
* Stock

## Clear Filters

A **Clear Filters** action resets the active:

* Search
* Category
* Sorting
* Pagination

---

# 7. Search + Category Filtering

DummyJSON provides separate endpoints for product search and category filtering.

Because there is no single API endpoint for combining both operations, NexStore handles this case on the client.

When both a search term and category are selected:

1. Products for the selected category are requested.
2. The returned products are filtered locally.
3. Search is performed against:

   * Title
   * Description
   * Brand
4. The resulting collection is paginated.

The UI displays an indicator when category-scoped search is being performed.

---

# 8. Product Details

Product details are available through:

```text
/products/:id
```

The detail page includes:

* Product image gallery
* Thumbnail navigation
* Product title
* Brand
* SKU
* Price
* Discount
* Rating
* Stock status
* Shipping information
* Warranty information
* Return policy
* Customer reviews

### 404 Handling

Invalid or unavailable product IDs display a user-friendly **404 Not Found** page.

Example:

```text
/products/999999
```

---

# 9. Add & Edit Products

NexStore provides a reusable product form modal for creating and editing products.

### Validation

The form validates:

* Title — minimum 3 characters
* Category — required
* Price — must be positive
* Stock — non-negative integer
* Description — minimum 10 characters
* Image URL — valid URL format

The image preview is displayed when a valid image URL is entered.

---

# 10. Delete Products

Deleting a product requires explicit confirmation through a confirmation modal.

This prevents accidental deletion.

### Double-Submit Protection

Mutation actions use a synchronous submission lock to prevent duplicate operations caused by rapid clicks.

This protects against:

```text
Double click
      ↓
Two mutation requests
      ↓
Duplicate operation
```

Instead, the second submission is blocked while the first operation is being processed.

---

# 11. Mock API Mutation Persistence

DummyJSON is a mock API. Mutation endpoints such as:

```text
POST /products/add
PUT /products/:id
DELETE /products/:id
```

return simulated responses but do not permanently modify the remote product database.

To provide a realistic CRUD experience, NexStore implements a local overlay system.

### `localOverlayService`

The service stores:

```text
added
modified
deleted
```

product information in `localStorage`.

### Add Product

1. Product is sent to DummyJSON.
2. The simulated response is received.
3. The new product is stored in the local overlay.
4. The product becomes available in the application.

### Edit Product

1. The update request is sent to DummyJSON.
2. The modified product data is stored locally.
3. Future product requests merge the local changes.

### Delete Product

1. The delete request is sent to DummyJSON.
2. The product ID is stored in the deleted overlay.
3. The product is excluded from future application results.

### Reset Mock Edits

A **Reset Mock Edits** action is provided to remove local modifications and return the application to the original DummyJSON data.

---

# 12. Mock ID Collision & 404 Handling

One challenge with the local mutation overlay is that DummyJSON may return simulated IDs for newly created products.

For example:

```text
New product ID: 195
```

The API may return the object successfully, but:

```text
GET /products/195
```

can still return `404` because the product does not actually exist in DummyJSON's remote database.

### Solution

`productService.getProductById(id)` first checks the local overlay.

The process is:

```text
Request product by ID
        ↓
Check locally added products
        ↓
Found?
 ┌──────┴──────┐
Yes           No
 ↓             ↓
Return       Request
local data   DummyJSON
```

If the product exists locally, the application returns the locally stored product without making another remote request.

For existing remote products, the service requests the product from DummyJSON.

Deleted products are also handled through the local overlay.

---

# 13. URL State Synchronization

Product dashboard state is synchronized with the URL.

The following values can be represented in query parameters:

* Page
* Page size
* Search
* Category
* Sort

Example:

```text
/products?page=2&search=phone&limit=20
```

This provides:

* Refresh persistence
* Shareable URLs
* Browser navigation support
* Deep-link support

---

# 14. URL Validation & Tampering Protection

Query parameters are validated before being used.

The `parseProductQueryParams()` function handles malformed parameters.

### Invalid Page

```text
?page=abc
```

falls back to:

```text
page=1
```

### Negative Page

```text
?page=-10
```

falls back to a valid page.

### Invalid Page Size

Only these page sizes are supported:

```text
10
20
50
```

Unsupported values are normalized to a supported value.

### Page Beyond Available Results

If a URL requests a page greater than the available number of pages:

```text
?page=999
```

the application clamps the page to the last valid page after the total product count is known.

---

# 15. Centralized Axios Configuration

Axios is configured centrally in:

```text
src/api/axiosInstance.js
```

### Request Interceptor

The request interceptor automatically retrieves the authentication token from local storage and attaches:

```http
Authorization: Bearer <token>
```

to authenticated requests.

### Response Interceptor

The response interceptor:

* Normalizes API error messages
* Handles `401 Unauthorized`
* Clears invalid authentication state
* Redirects the user to the login page

This keeps authentication and API error handling consistent across the application.

---

# 16. Loading, Empty & Error States

The application provides dedicated UI states for different request conditions.

### Loading State

Responsive skeleton loaders are displayed while products are loading.

Desktop:

```text
Skeleton table rows
```

Mobile:

```text
Skeleton product cards
```

### Empty State

When no products match the current filters, the application displays an empty state with actions such as:

* Reset Filters
* Add New Product

### Error State

API failures display a user-friendly error message with:

```text
Retry
```

functionality.

---

# 🧩 Project Structure

A simplified project structure:

```text
src/
├── api/
│   └── axiosInstance.js
│
├── components/
│   ├── ...
│
├── hooks/
│   ├── useProducts.js
│   └── useDebounce.js
│
├── pages/
│   ├── Login.jsx
│   ├── Products.jsx
│   ├── ProductDetails.jsx
│   └── NotFound.jsx
│
├── services/
│   ├── productService.js
│   └── localOverlayService.js
│
├── routes/
│   └── ProtectedRoute.jsx
│
└── ...
```

---

# 🧪 Edge Cases Handled

NexStore is designed to handle several real-world frontend scenarios:

* Invalid login credentials
* Network failures
* Expired authentication
* Unauthorized API responses
* Rapid search input
* Out-of-order API responses
* Request cancellation
* Duplicate form submissions
* Empty search results
* Invalid product IDs
* Deleted products
* Locally created products
* Mock API mutation limitations
* URL parameter tampering
* Invalid pagination values
* Page numbers beyond the available range
* Slow network responses
* Responsive desktop/mobile layouts

---

# 💻 Local Setup & Development

## Prerequisites

Make sure the following are installed:

* **Node.js** v18 or higher
* **npm** v9 or higher

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>

# 2. Navigate into the project
cd nexstore

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

# 🌐 Deployment

The application can be deployed using platforms such as:

* Vercel
* Netlify

After deployment, update the **Live Demo** link at the top of this README.

---

# 🔑 Demo Login

Use the following DummyJSON credentials for testing:

```text
Username: emilys
Password: emilyspass
```

---

# 📸 Screenshots

Add screenshots of the following pages to showcase the project:

* Login page
* Product dashboard
* Search and filtering
* Product details
* Add/Edit product modal
* Delete confirmation
* Mobile responsive view

Example:

```markdown
![Login Page](screenshots/login.png)

![Product Dashboard](screenshots/dashboard.png)

![Product Details](screenshots/product-details.png)
```

---

# 📌 Key Technical Highlights

The project demonstrates practical frontend development concepts including:

* React component architecture
* Custom React hooks
* REST API integration
* Axios interceptors
* Authentication
* Protected routes
* CRUD operations
* Server-side pagination
* Debounced search
* Request cancellation
* Race-condition prevention
* Client-side filtering
* Sorting
* URL state synchronization
* LocalStorage persistence
* Form validation
* Responsive design
* Loading and error states
* Mock API handling
* Edge-case handling

---

# 📄 License

This project was developed as a **Frontend Assignment — Product Admin Dashboard**.

The project uses the [DummyJSON API](https://dummyjson.com) for demonstration and testing purposes.
