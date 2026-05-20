import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PartTimeWorkLog } from "@/types/part-time";
import { PaymentStatusBadge } from "./payment-status-badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { partTimeService } from "@/services/part-time";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WorkLogTableProps {
  logs: PartTimeWorkLog[];
  onDelete?: (id: string) => void;
  onEdit?: (log: PartTimeWorkLog) => void;
  showWorkerName?: boolean;
}

export const WorkLogTable: React.FC<WorkLogTableProps> = ({
  logs,
  onDelete,
  onEdit,
  showWorkerName = true,
}) => {
  const queryClient = useQueryClient();
  const [advanceValues, setAdvanceValues] = React.useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = React.useState<
    Record<string, "idle" | "saving" | "saved" | "error">
  >({});

  const updateAdvanceMutation = useMutation({
    mutationFn: ({ id, advance }: { id: string; advance: number }) =>
      partTimeService.updateWorkLog(id, { advance_paid: advance } as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["part-time-work-logs"] });
      setSaveStatus((prev) => ({ ...prev, [variables.id]: "saved" }));
      toast.success("Advance payment updated");
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [variables.id]: "idle" }));
      }, 3000);
    },
    onError: (error: any, variables) => {
      setSaveStatus((prev) => ({ ...prev, [variables.id]: "error" }));
      toast.error(error.message || "Failed to update advance");
    },
  });

  const handleAdvanceChange = (id: string, value: string) => {
    setAdvanceValues((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
    setSaveStatus((prev) => ({ ...prev, [id]: "idle" }));
  };

  const onUpdateAdvance = (log: PartTimeWorkLog) => {
    const newVal = advanceValues[log.id];
    if (newVal === undefined || newVal === log.advance_paid) return;
    setSaveStatus((prev) => ({ ...prev, [log.id]: "saving" }));
    updateAdvanceMutation.mutate({ id: log.id, advance: newVal });
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            {showWorkerName && (
              <TableHead className="font-semibold text-dark-slate">Worker</TableHead>
            )}
            <TableHead className="font-semibold text-dark-slate">Client</TableHead>
            <TableHead className="font-semibold text-dark-slate">Date</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">Quantity</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">Slab Price</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">Total</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">Advance Paid</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">
              Remaining Balance
            </TableHead>
            <TableHead className="font-semibold text-dark-slate">Delivery Location</TableHead>
            <TableHead className="font-semibold text-dark-slate">Status</TableHead>
            <TableHead className="text-right font-semibold text-dark-slate">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showWorkerName ? 9 : 8}
                className="h-24 text-center text-muted-foreground"
              >
                No work logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-gray-50/30 transition-colors">
                {showWorkerName && (
                  <TableCell className="font-medium">{log.worker?.full_name || "N/A"}</TableCell>
                )}
                <TableCell>{log.client_name}</TableCell>
                <TableCell>{format(new Date(log.working_date), "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-right">{log.slab_quantity}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ₹{log.slab_price.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{log.total_price.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 w-24 text-right text-xs bg-white/50"
                      defaultValue={log.advance_paid}
                      onChange={(e) => handleAdvanceChange(log.id, e.target.value)}
                    />
                    <div className="text-[10px] font-medium" id={`advance-msg-${log.id}`}>
                      {saveStatus[log.id] === "saving" && (
                        <span className="text-blue-500 animate-pulse">Saving...</span>
                      )}
                      {saveStatus[log.id] === "saved" && (
                        <span className="text-emerald-500">
                          Saved. Balance: ₹{log.remaining_balance.toLocaleString()}
                        </span>
                      )}
                      {saveStatus[log.id] === "error" && (
                        <span className="text-rose-500">Failed</span>
                      )}
                      {(!saveStatus[log.id] || saveStatus[log.id] === "idle") && (
                        <span className="text-muted-foreground">
                          Balance: ₹{log.remaining_balance.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-[10px] text-deep-blue font-bold uppercase tracking-wider"
                      onClick={() => onUpdateAdvance(log)}
                      disabled={saveStatus[log.id] === "saving"}
                    >
                      Update
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right text-rose-600 font-medium">
                  ₹{log.remaining_balance.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.delivery_location || "—"}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={log.payment_status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Link to="/employees/$id" params={{ id: log.worker_id }}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => onEdit?.(log)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => onDelete?.(log.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
