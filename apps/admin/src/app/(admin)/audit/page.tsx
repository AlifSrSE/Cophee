import { Suspense } from "react";
import AuditLogClient from "./audit-client";

export default function AuditLogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading audit logs...</div>}>
      <AuditLogClient />
    </Suspense>
  );
}
