import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmployeesTable } from "@/components/employees-table";

export const Route = createFileRoute("/_app/employees/full-time")({
  component: () => (
    <>
      <PageHeader title="Full-Time Employees" description="Permanent salaried staff" />
      <div className="p-6">
        <EmployeesTable filterType="full_time" />
      </div>
    </>
  ),
});
