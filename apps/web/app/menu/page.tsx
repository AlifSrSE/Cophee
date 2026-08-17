import Link from "next/link";
import { Suspense } from "react";
import MenuClient from "./menu-client";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                ☕ Cophee
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/menu" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Menu
              </Link>
              <Link href="/track-order" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Track Order
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Menu</h2>
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading menu...</div>}>
          <MenuClient />
        </Suspense>
      </main>
    </div>
  );
}
