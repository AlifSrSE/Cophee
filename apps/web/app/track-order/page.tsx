"use client";

import Link from "next/link";
import { useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  source: string;
  table: {
    number: string;
  } | null;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }[];
}

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const params = new URLSearchParams();
      if (phone) params.append("phone", phone);
      if (orderNumber) params.append("orderNumber", orderNumber);

      const response = await fetch(`/api/v1/orders/customer?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      const data = await response.json();
      setOrder(data);
    } catch {
      setError("Order not found. Please check your phone number or order number.");
    } finally {
      setLoading(false);
    }
  };

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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h2>

        <form onSubmit={searchOrder} className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Order Number (optional)
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., ORD-1234567890-ABC123"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Source</p>
                  <p className="font-medium">{order.source}</p>
                </div>
                <div>
                  <p className="text-gray-500">Table</p>
                  <p className="font-medium">{order.table ? `Table ${order.table.number}` : "-"}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-medium mb-2">Items</h4>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm text-gray-600">
                      {item.product.name} x {item.quantity} - ${(item.unitPrice * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
