"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  table: {
    number: string;
  } | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }[];
}

export default function OrderStatusClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      const data = await response.json();
      setOrder(data);
      setError("");
    } catch (err) {
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
      const interval = setInterval(fetchOrderStatus, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("No order ID provided");
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PREPARING":
        return "bg-blue-100 text-blue-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your order has been received and is waiting to be prepared.";
      case "PREPARING":
        return "Your order is being prepared by our kitchen.";
      case "READY":
        return "Your order is ready! Please pick it up at the counter.";
      case "COMPLETED":
        return "Your order has been completed. Thank you!";
      case "CANCELLED":
        return "Your order has been cancelled.";
      default:
        return "Processing your order...";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading order status...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error || "Order not found"}</div>
          <a href="/" className="text-indigo-600 hover:text-indigo-700">
            Go back to home
          </a>
        </div>
      </div>
    );
  }

  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">☕ Cophee</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Table #{order.table?.number || "-"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">{getStatusText(order.status)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              This page will automatically update every 5 seconds.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
