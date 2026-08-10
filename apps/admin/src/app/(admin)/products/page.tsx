import { Suspense } from "react";
import ProductsClient from "./products-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading products...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
