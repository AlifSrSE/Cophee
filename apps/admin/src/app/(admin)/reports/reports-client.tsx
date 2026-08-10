import { prisma } from "@cophee/database";

async function getSalesReport() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [todayOrders, todayRevenue, orderStatusCounts] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        _count: {
          status: true,
        },
      }),
    ]);

    return {
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      orderStatusCounts,
    };
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return {
      todayOrders: 0,
      todayRevenue: 0,
      orderStatusCounts: [],
    };
  }
}

export default async function ReportsClient() {
  const report = await getSalesReport();

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PREPARING: "bg-blue-100 text-blue-800",
    READY: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Sales and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Today&apos;s Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${report.todayRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Today&apos;s Orders</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {report.todayOrders}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order Status Breakdown</h3>
        </div>
        <div className="p-6">
          {report.orderStatusCounts.length === 0 ? (
            <p className="text-gray-500">No orders today</p>
          ) : (
            <div className="space-y-3">
              {report.orderStatusCounts.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {item.status}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[item.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item._count.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
