import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import { partTimeService } from "@/services/part-time";
import { PartTimeWorkLog, PartTimeWorkLogFormValues } from "@/types/part-time";
import { WorkEntryForm } from "@/components/part-time/work-entry-form";
import { WorkLogTable } from "@/components/part-time/work-log-table";
import { AnalyticsDashboardCards } from "@/components/part-time/analytics-cards";

export const Route = createFileRoute("/_app/employees/part-time")({
  component: PartTimeWork,
});

type EditModalState =
  | { open: false }
  | {
      open: true;
      log: PartTimeWorkLog;
    };

function PartTimeWork() {
  const qc = useQueryClient();
  const [editModal, setEditModal] = useState<EditModalState>({ open: false });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: workers = [] } = useQuery({
    queryKey: ["part-time-workers"],
    queryFn: () => partTimeService.getWorkers(),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["part-time-work-logs"],
    queryFn: () => partTimeService.getWorkLogs(),
  });

  const stats = useMemo(() => {
    const totalWorkers = workers.length;
    const totalWorkEntries = logs.length;
    const totalPaidAmount = logs.reduce((acc, l) => acc + Number(l.advance_paid || 0), 0);
    const pendingPayments = logs.reduce((acc, l) => acc + Number(l.remaining_balance || 0), 0);

    // Unique active clients
    const activeClients = new Set(logs.map((l) => l.client_name)).size;

    // Earnings in the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyEarnings = logs
      .filter((l) => {
        const d = new Date(l.working_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, l) => acc + Number(l.total_price || 0), 0);

    return {
      totalWorkers,
      totalWorkEntries,
      totalPaidAmount,
      pendingPayments,
      activeClients,
      monthlyEarnings,
    };
  }, [workers, logs]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const query = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const workerName = log.worker?.full_name?.toLowerCase() || "";
      const clientName = log.client_name?.toLowerCase() || "";
      const location = log.delivery_location?.toLowerCase() || "";
      return workerName.includes(query) || clientName.includes(query) || location.includes(query);
    });
  }, [logs, searchTerm]);

  const createMutation = useMutation({
    mutationFn: (values: PartTimeWorkLogFormValues) => partTimeService.createWorkLog(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["part-time-work-logs"] });
      toast.success("Work entry saved successfully");
    },
    onError: (e: any) => toast.error(e?.message || "Failed to save work entry"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PartTimeWorkLogFormValues }) =>
      partTimeService.updateWorkLog(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["part-time-work-logs"] });
      toast.success("Work entry updated successfully");
      setEditModal({ open: false });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update work entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partTimeService.deleteWorkLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["part-time-work-logs"] });
      toast.success("Work entry deleted successfully");
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete work entry"),
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this work entry?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <PageHeader
        title="Part-Time Management"
        description="Track slab quantities, calculate total price, payouts, and outstanding balances"
        action={<EmployeeFormDialog defaultType="part_time" />}
      />

      <div className="p-6 space-y-6">
        <AnalyticsDashboardCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-gray-100/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-dark-slate">
                  <PlusCircle className="h-5 w-5 text-deep-blue" />
                  Add Work Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <WorkEntryForm
                  onSubmit={(values) => createMutation.mutate(values)}
                  isLoading={createMutation.isPending}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-gray-100/50 flex flex-row items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-base font-semibold text-dark-slate">
                  Work Entries & Payout Log
                </CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search worker, client, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/80 border-gray-200 focus:ring-tech-blue h-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6 px-0 sm:px-6">
                <WorkLogTable
                  logs={filteredLogs}
                  onEdit={(log) => setEditModal({ open: true, log })}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={editModal.open} onOpenChange={(open) => !open && setEditModal({ open: false })}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Work Entry</DialogTitle>
          </DialogHeader>
          {editModal.open && (
            <div className="pt-4">
              <WorkEntryForm
                initialValues={editModal.log}
                onSubmit={(values) => editMutation.mutate({ id: editModal.log.id, values })}
                isLoading={editMutation.isPending}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
