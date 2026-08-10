import Link from "next/link";
import { auth } from "@/lib/auth";

async function getNavigation() {
  const session = await auth();
  if (!session) return { user: null, navigation: [] };

  const navigation = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Orders", href: "/orders", icon: "📋", roles: ["OWNER", "MANAGER", "STAFF"] },
    { name: "Tables", href: "/tables", icon: "🪑", roles: ["OWNER", "MANAGER", "STAFF"] },
    { name: "POS", href: "/pos", icon: "🖥️", roles: ["OWNER", "MANAGER", "STAFF"] },
    { name: "Products", href: "/products", icon: "📦", roles: ["OWNER", "MANAGER", "STAFF"] },
    { name: "Inventory", href: "/inventory", icon: "📦", roles: ["OWNER", "MANAGER", "STAFF"] },
    { name: "Employees", href: "/employees", icon: "👥", roles: ["OWNER"] },
    { name: "Reports", href: "/reports", icon: "📈", roles: ["OWNER", "MANAGER"] },
    { name: "Audit Log", href: "/audit", icon: "📝", roles: ["OWNER"] },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any)?.role as string;
  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return {
    user: session.user,
    navigation: filteredNavigation,
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, navigation } = await getNavigation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">Cophee Admin</h1>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.name}{" "}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(user as any).role as string}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
