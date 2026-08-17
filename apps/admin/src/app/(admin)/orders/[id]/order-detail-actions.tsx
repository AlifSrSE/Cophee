"use client";

import { useState } from "react";

interface OrderDetailActionsProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderDetailActions({ orderId, currentStatus }: OrderDetailActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert("Order status updated successfully");
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
      <div className="flex items-center space-x-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isUpdating}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          onClick={updateStatus}
          disabled={isUpdating || status === currentStatus}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}
