import { prisma } from "@cophee/database";

async function getDashboardStats() {
  try {
    const [totalOrders, pendingOrders, totalProducts, lowStockItems, totalEmployees] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.inventoryItem.count({ where: { currentStock: { lte: prisma.inventoryItem.fields.minStock } } }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockItems,
      totalEmployees,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalProducts: 0,
      lowStockItems: 0,
      totalEmployees: 0,
    };
  }
}

export default async function DashboardClient() {
  const stats = await getDashboardStats();

  const statCards = [
    { name: "Total Orders", value: stats.totalOrders, icon: "📋", color: "bg-blue-500" },
    { name: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "bg-yellow-500" },
    { name: "Active Products", value: stats.totalProducts, icon: "📦", color: "bg-green-500" },
    { name: "Low Stock Items", value: stats.lowStockItems, icon: "⚠️", color: "bg-red-500" },
    { name: "Active Employees", value: stats.totalEmployees, icon: "👥", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Cophee Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3 text-white text-2xl`}>
                    {card.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/pos"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="text-2xl">🖥️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Order</p>
                <p className="text-sm text-gray-500">Create a new POS order</p>
              </div>
            </a>
            <a
              href="/tables"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="text-2xl">🪑</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Manage Tables</p>
                <p className="text-sm text-gray-500">Update table status</p>
              </div>
            </a>
            <a
              href="/reports"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="text-2xl">📈</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-500">Sales and analytics</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
