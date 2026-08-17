import { Suspense } from "react";
import OrderDetailClient from "./order-detail-client";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading order...</div>}>
      <OrderDetailClient id={id} />
    </Suspense>
  );
}
