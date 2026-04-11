# 📝 TaskForge - React implementation

A fast, modern, and responsive **TaskForge System** application built with **React (TypeScript)**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**, featuring offline persistence via **Dexie.js (IndexedDB)**.  
The app supports searching, filtering, editing, deleting, and pagination — all within a clean, accessible UI.

---

## 🌟 Features

- Add, edit, and delete todos with instant feedback.
- Search todos by title.
- Filter by status: completed / incomplete / all.
- View detailed todo pages (ID, title, and status)
- Offline support using IndexedDB (via Dexie.js).
- Paginated todo list (10 items per page)
- Inline editing & delete confirmation modals
- Dark-themed, accessible UI using **Tailwind v4** + **shadcn/ui**
- Modular, maintainable architecture

---

## 🚀 Installation & Setup

### 1. Clone the Repository

git clone https://github.com/ibeO-GH/taskforge-react.git
cd taskforge-react

### 2. Install Dependencies

npm install

### 3. Start Development Server

npm run dev

The app runs locally at http://localhost:5173 (Vite default) or the port specified by your setup\*\*

---

## 📜 Available Scripts

- npm run dev - Start development Server.
- npm run build - Build the app for production.
- npm run preview - Preview the production build.
- npm run lint - Run ESLint checks.

---

## 🧱 Technology Stack

- Framework - React 19 + TypeScript
- Build Tool - Vite
- Styling - Tailwind CSS v4 + shadcn/ui
- State & Data - TanStack Query (React Query)
- Database - Dexie.js - for IndexedDB offline persistence
- Routing - TanStack Router
- Icons - Lucide React

---

## 🧠 Architecture & Decisions

- Dexie.js - Provides offline-first data storage and persistence via IndexedDB

- React Query - Handles async caching, background updates, and mutation tracking

- Tailwind v4 + shadcn/ui - Offers design consistency and a scalable styling system

- Component-based architecture - Clear separation of logic for maintainability

- Error Boundaries - Graceful fallback for runtime or route-level errors

---

## 📡 API & Data Flow

Although initially designed to fetch from [JSONPlaceholder](https://jsonplaceholder.typicode.com/), the app primarily uses IndexedDB (Dexie.js) for all CRUD operations.

- Endpoints (for demo/reference)

GET /todos

- Fetches a list of todos (limited to 20 in the app)
  Response:[
  {
  "userId": 198,
  "id": 198,
  "title": "quis eius est sint explicabo",
  "completed": false
  },
  ...
  ]

GET /todos/:id

- Fetches a single todo by ID.
  Response:[
  "userId": 198,
  "id": 198,
  "title": "quis eius est sint explicabo",
  "completed": false
  ];

## Query Flow

- useQuery() - Reads todos from IndexedDB

- useMutation() - Manages create/update/delete actions

- On mutation - Queries are invalidated to auto-refresh the UI

---

## Local Database (Dexie.js)

- todos: Stores active todo items objects (userId, id, title, completed).
- deletedTodos: Tracks deleted API todos.

CRUD operations are handled in:

- todoDb.ts
- TodoList.tsx
- TodoDetail.tsx

---

## ⚠️ Known Issues

- ❗ No drag-and-drop reordering.

- ❗ No cloud sync – data stored in the browser.

- ❗ IndexedDB data is cleared when browser storage is wiped.

---

## 🔮 Future Improvements

- Drag-and-drop reordering

- Cloud sync via Firebase/Supabase

- Light/Dark theme toggle

- Add due dates & priority labels

- Export/import todos as JSON/CSV for backup

- Lazy loading for performance at scale

---

## Project Structure

src/
├── components/
│ ├── TodoList.tsx
│ ├── TodoDetail.tsx
│ ├── ui/
│ └── ErrorBoundary.tsx
├── db/
│ └── todoDb.ts
├── lib/
│ └── utils.ts
├── App.tsx
├── main.tsx
└── index.css

---

## Live Demo

### Hosted on Vercel

---

## Acknowledgments

shadcn/ui, React Query, Dexie.js, Tailwind CSS, Radix UI

---

## 🌐 Part of TaskForge Ecosystem

This project is part of the **TaskForge** system.

Explore other implementations:

- Core → https://github.com/ibeO-GH/taskforge
- Next.js → https://github.com/ibeO-GH/taskforge-next
- Vue → https://github.com/ibeO-GH/taskforge-vue
