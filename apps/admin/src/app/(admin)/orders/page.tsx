import { Suspense } from "react";
import OrdersClient from "./orders-client";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading orders...</div>}>
      <OrdersClient />
    </Suspense>
  );
}
