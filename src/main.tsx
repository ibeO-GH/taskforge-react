import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import TodoDetail from "./components/TodoDetail";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import TestError from "./components/TestError";
import RouteError from "./components/RouteError";

// ✅ Initialize React Query client
const queryClient = new QueryClient();

// ✅ Define your routes
const rootRoute = createRootRoute({
  component: Layout,
  errorComponent: RouteError,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos/$id",
  component: TodoDetail,
});

const errorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error-test",
  component: TestError,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-amber-600">Oops! That route doesn’t exist.</p>
      <a
        href="/"
        className="text-blue-500 underline mt-6 block hover:text-green-600"
      >
        Go back home
      </a>
    </div>
  ),
});

// ❌ Remove the invalid "strict" option
// ✅ Proper router initialization
const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    detailRoute,
    errorRoute,
    notFoundRoute,
  ]),
  defaultPreload: "intent",
});

// ✅ Type augmentation for React Router (TypeScript requirement)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ✅ Render the app
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error("❌ Root element not found");
}
