import { Suspense } from "react";
import TablesClient from "./tables-client";

export default function TablesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading tables...</div>}>
      <TablesClient />
    </Suspense>
  );
}
