import { Suspense } from "react";
import InventoryClient from "./inventory-client";

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading inventory...</div>}>
      <InventoryClient />
    </Suspense>
  );
}
