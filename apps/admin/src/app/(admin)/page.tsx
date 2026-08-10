import { Suspense } from "react";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
