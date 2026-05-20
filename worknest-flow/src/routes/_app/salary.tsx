import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeSalary, formatCurrency } from "@/lib/salary";
import { toast } from "sonner";
import { Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/_app/salary")({
  component: SalaryPage,
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function SalaryPage() {
  const qc = useQueryClient();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ["salary", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .eq("month", month)
        .eq("year", year);
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-month", month, year],
    queryFn: async () => {
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const to = new Date(year, month, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .eq("status", "absent");
      if (error) throw error;
      return data;
    },
  });

  const { data: advances = [] } = useQuery({
    queryKey: ["advance-month", month, year],
    queryFn: async () => {
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const to = new Date(year, month, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("advance_salary")
        .select("*")
        .gte("date", from)
        .lte("date", to);
      if (error) throw error;
      return data;
    },
  });

  const { data: partTimeLogs = [] } = useQuery({
    queryKey: ["part-time-work-logs-month", month, year],
    queryFn: async () => {
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const to = new Date(year, month, 0).toISOString().slice(0, 10);
      const { data, error } = await (supabase as any)
        .from("part_time_work_logs")
        .select("*")
        .gte("working_date", from)
        .lte("working_date", to);
      if (error) throw error;
      return data;
    },
  });

  const computed = useMemo(
    () =>
      employees.map((e) => {
        const existing = records.find((r) => r.employee_id === e.id);

        // Part-time: salary = sum of all slab total_price for that month/year.
        if (e.employee_type === "part_time") {
          const total = partTimeLogs
            .filter((log: any) => log.worker_id === e.id)
            .reduce((sum: number, log: any) => sum + Number(log.total_price || 0), 0);

          return {
            employee: e,
            existing,
            absentDays: 0,
            advanceTotal: 0,
            dailySalary: 0,
            deductedAmount: 0,
            finalSalary: Number(total || 0),
          };
        }

        // Full-time: existing logic (absent deductions + advance deductions)
        const absentDays = attendance.filter((a: any) => a.employee_id === e.id).length;
        const advanceTotal = advances
          .filter((a: any) => a.employee_id === e.id)
          .reduce((s: number, a: any) => s + Number(a.amount), 0);

        const calc = computeSalary({
          monthlySalary: Number(e.salary),
          absentDays,
          advanceSalary: advanceTotal,
        });

        return { employee: e, existing, absentDays, advanceTotal, ...calc };
      }),
    [employees, records, attendance, advances, partTimeLogs],
  );

  const generateAll = async () => {
    const rows = computed
      .filter((c) => !c.existing)
      .map((c) => ({
        employee_id: c.employee.id,
        month,
        year,
        monthly_salary: Number(c.employee.salary),
        daily_salary: c.dailySalary,
        absent_days: c.absentDays,
        advance_salary: c.advanceTotal,
        deducted_amount: c.deductedAmount,
        final_salary: c.finalSalary,
        payment_status: "pending" as const,
      }));
    if (rows.length === 0) return toast.info("All records already generated for this period.");
    const { error } = await supabase.from("salary_records").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Generated ${rows.length} salary records`);
    qc.invalidateQueries({ queryKey: ["salary", month, year] });
  };

  const markPaid = async (id: string) => {
    const { error } = await supabase
      .from("salary_records")
      .update({
        payment_status: "paid",
        payment_date: new Date().toISOString().slice(0, 10),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked as paid");
    qc.invalidateQueries({ queryKey: ["salary", month, year] });
  };

  return (
    <>
      <PageHeader
        title="Salary Records"
        description="Full-time salary: daily rate with absent + advances. Part-time salary: summed total slabs from work logs (no attendance deduction)."
        action={
          <div className="flex gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(
                  (y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={generateAll}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </Button>
          </div>
        }
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Daily</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Advance</TableHead>
                <TableHead>Deducted</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {computed.map((c) => (
                <TableRow key={c.employee.id}>
                  <TableCell className="font-medium">{c.employee.full_name}</TableCell>
                  <TableCell>{formatCurrency(Number(c.employee.salary))}</TableCell>
                  <TableCell>
                    {c.employee.employee_type === "part_time" ? "—" : formatCurrency(c.dailySalary)}
                  </TableCell>
                  <TableCell>
                    {c.employee.employee_type === "part_time" ? "—" : `${c.absentDays}d`}
                  </TableCell>
                  <TableCell>
                    {c.employee.employee_type === "part_time"
                      ? "—"
                      : formatCurrency(c.advanceTotal)}
                  </TableCell>
                  <TableCell className="text-destructive">
                    {c.employee.employee_type === "part_time"
                      ? "—"
                      : `−${formatCurrency(c.deductedAmount)}`}
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(c.finalSalary)}</TableCell>
                  <TableCell>
                    {c.existing ? (
                      <Badge
                        variant={c.existing.payment_status === "paid" ? "default" : "secondary"}
                      >
                        {c.existing.payment_status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not generated</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.existing && c.existing.payment_status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(c.existing!.id)}>
                        <Check className="mr-1 h-4 w-4" /> Mark paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Add employees first.
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
