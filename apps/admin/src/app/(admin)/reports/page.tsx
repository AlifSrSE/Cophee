import { Suspense } from "react";
import ReportsClient from "./reports-client";

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading reports...</div>}>
      <ReportsClient />
    </Suspense>
  );
}
