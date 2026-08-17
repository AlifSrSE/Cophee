import { Suspense } from "react";
import OrderConfirmationClient from "./order-confirmation-client";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <OrderConfirmationClient />
    </Suspense>
  );
}
