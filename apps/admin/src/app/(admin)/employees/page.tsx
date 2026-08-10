import { Suspense } from "react";
import EmployeesClient from "./employees-client";

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading employees...</div>}>
      <EmployeesClient />
    </Suspense>
  );
}
