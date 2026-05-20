import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Check, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/salary";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/advance")({
  component: AdvancePage,
});

function AdvancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: advances = [] } = useQuery({
    queryKey: ["advances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advance_salary")
        .select("*, employees(full_name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("advance_salary").insert({
      employee_id: employeeId,
      amount: Number(amount),
      reason: reason || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Advance recorded");
    setOpen(false);
    setEmployeeId("");
    setAmount("");
    setReason("");
    qc.invalidateQueries({ queryKey: ["advances"] });
  };

  const settle = async (id: string) => {
    const { error } = await supabase.from("advance_salary").update({ settled: true }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["advances"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this advance record?")) return;
    const { error } = await supabase.from("advance_salary").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["advances"] });
  };

  return (
    <>
      <PageHeader
        title="Advance Salary"
        description="Track salary advances and their settlement"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Record advance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record an advance</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Employee</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reason (optional)</Label>
                  <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={!employeeId || !amount}
                    className="bg-gradient-brand text-primary-foreground hover:opacity-90"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-muted-foreground">{a.date}</TableCell>
                  <TableCell className="font-medium">{a.employees?.full_name ?? "—"}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(Number(a.amount))}</TableCell>
                  <TableCell className="text-muted-foreground">{a.reason || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={a.settled ? "default" : "secondary"}>
                      {a.settled ? "Settled" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!a.settled && (
                      <Button size="sm" variant="outline" onClick={() => settle(a.id)}>
                        <Check className="mr-1 h-4 w-4" /> Settle
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {advances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No advances recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
