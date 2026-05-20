import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/salary";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: records = [] } = useQuery({
    queryKey: ["all-salary-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .order("year")
        .order("month");
      if (error) throw error;
      return data;
    },
  });

  const byPeriod = Object.values(
    records.reduce<Record<string, { period: string; total: number; paid: number }>>((acc, r) => {
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = { period: key, total: 0, paid: 0 };
      acc[key].total += Number(r.final_salary);
      if (r.payment_status === "paid") acc[key].paid += Number(r.final_salary);
      return acc;
    }, {}),
  );

  const totalPayroll = records.reduce((s, r) => s + Number(r.final_salary), 0);
  const totalPaid = records
    .filter((r) => r.payment_status === "paid")
    .reduce((s, r) => s + Number(r.final_salary), 0);
  const totalPending = totalPayroll - totalPaid;

  return (
    <>
      <PageHeader title="Reports" description="Salary and attendance analytics" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total payroll" value={formatCurrency(totalPayroll)} />
          <Stat label="Paid" value={formatCurrency(totalPaid)} accent="text-success" />
          <Stat label="Pending" value={formatCurrency(totalPending)} accent="text-warning" />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Payroll trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byPeriod}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {byPeriod.length === 0 && (
              <div className="-mt-64 flex h-64 items-center justify-center text-sm text-muted-foreground">
                No data yet — generate salary records first.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}
