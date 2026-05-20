import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { EmployeesTable } from "@/components/employees-table";

export const Route = createFileRoute("/_app/employees/")({
  component: () => (
    <>
      <PageHeader title="All Employees" description="Full-time and part-time team members" />
      <div className="p-6">
        <EmployeesTable />
      </div>
    </>
  ),
});
