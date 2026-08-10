import { Suspense } from "react";
import POSClient from "./pos-client";

export default function POSPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading POS...</div>}>
      <POSClient />
    </Suspense>
  );
}
