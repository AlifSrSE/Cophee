import { Suspense } from "react";
import TablesPageClient from "./tables-page-client";

export default function TablesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading tables...</div>}>
      <TablesPageClient />
    </Suspense>
  );
}
