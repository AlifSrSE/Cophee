import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">☕ Cophee</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Cophee
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Order your favorite coffee and food online
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/menu"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Menu
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Track Order
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
