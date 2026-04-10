import { Outlet, Link } from "@tanstack/react-router";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-sans">
      <header className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 shadow-lg border-b border-black">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-center sm:justify-between items-center">
          <Link
            to="/"
            className="text-3xl font-bold text-white tracking-wide hover:opacity-90 transition text-center"
          >
            📝 MyTodo
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
