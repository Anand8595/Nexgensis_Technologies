# NexStore — Product Admin Dashboard

A modern, high-performance product inventory dashboard built with **React 19**, **Tailwind CSS v4**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

🔗 **Live Demo:** [NexStore on Vercel](https://nexgensis-technologies.vercel.app/)  
---

## 🛠️ Tech Stack

| Layer | Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| **Routing** | React Router DOM v7 (with `ProtectedRoute`) |
| **Networking** | Axios (centralized interceptors + `AbortController`) |
| **State** | Native React Hooks (`useProducts`, `useDebounce`, `localStorage`) |
| **Data Source** | DummyJSON API + Client-side mock mutation overlay |

---

## ⚡ Quick Start

```bash
# 1. Clone & install
git clone <your-repo-url>
cd nexstore
npm install

# 2. Run locally (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build
