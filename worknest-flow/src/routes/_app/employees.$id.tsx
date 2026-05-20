import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/salary";
import {
  ArrowLeft,
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  Wallet,
  Package,
  TrendingUp,
  History,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { partTimeService } from "@/services/part-time";
import { WorkLogTable } from "@/components/part-time/work-log-table";
import { PaymentStatusBadge } from "@/components/part-time/payment-status-badge";
import { format, startOfMonth, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_app/employees/$id")({
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { id } = Route.useParams();

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["employee-attendance", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", id)
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const { data: salary = [] } = useQuery({
    queryKey: ["employee-salary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .eq("employee_id", id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: advances = [] } = useQuery({
    queryKey: ["employee-advances", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advance_salary")
        .select("*")
        .eq("employee_id", id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: partTimeLogs = [] } = useQuery({
    queryKey: ["employee-part-time-logs", id],
    queryFn: () => partTimeService.getWorkLogs({ worker_id: id }),
    enabled: !!employee && employee.employee_type === "part_time",
  });

  // Calculate monthly data for chart
  const monthlyData = React.useMemo(() => {
    if (!partTimeLogs.length) return [];
    const now = new Date();
    return Array.from({ length: 6 })
      .map((_, i) => {
        const date = subMonths(now, i);
        const monthStr = format(date, "MMM");
        const monthStart = startOfMonth(date);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const amount = partTimeLogs
          .filter((log) => {
            const d = new Date(log.working_date);
            return d >= monthStart && d <= monthEnd;
          })
          .reduce((sum, log) => sum + log.total_price, 0);

        return { month: monthStr, amount };
      })
      .reverse();
  }, [partTimeLogs]);

  if (isLoading || !employee) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHeader
        title={employee.full_name}
        description={
          employee.employee_type === "full_time" ? "Full-Time Employee" : "Part-Time Employee"
        }
        action={
          <Link to="/employees">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-soft md:col-span-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold text-primary-foreground">
              {employee.full_name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{employee.full_name}</h2>
            <Badge
              className="mt-2"
              variant={employee.employee_type === "full_time" ? "default" : "secondary"}
            >
              {employee.employee_type === "full_time" ? "Full-time" : "Part-time"}
            </Badge>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" /> {employee.phone || "—"}
              </div>
              <div className="flex items-center gap-3">
                <UserIcon className="h-4 w-4 text-muted-foreground" /> {employee.gender || "—"}, age{" "}
                {employee.age || "—"}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Joined{" "}
                {employee.joining_date}
              </div>
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />{" "}
                {formatCurrency(Number(employee.salary))}/mo
              </div>
            </div>

            {employee.employee_type === "part_time" && (
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Work Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="text-xs text-blue-600 font-medium">Total Slabs</div>
                    <div className="text-xl font-bold text-blue-700">
                      {partTimeLogs.reduce((acc, log) => acc + Number(log.slab_quantity), 0)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="text-xs text-emerald-600 font-medium">Earnings</div>
                    <div className="text-xl font-bold text-emerald-700">
                      ₹
                      {partTimeLogs.reduce((acc, log) => acc + log.total_price, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="text-xs text-amber-600 font-medium">Balance</div>
                    <div className="text-xl font-bold text-amber-700">
                      ₹
                      {partTimeLogs
                        .reduce((acc, log) => acc + log.remaining_balance, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="text-xs text-purple-600 font-medium">Clients</div>
                    <div className="text-xl font-bold text-purple-700">
                      {new Set(partTimeLogs.map((log) => log.client_name)).size}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 md:col-span-2">
            {employee.employee_type === "part_time" ? (
              <>
                <div className="rounded-2xl border bg-card p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                      <History className="h-5 w-5 text-deep-blue" />
                      Recent Work Logs
                    </h3>
                    <Link to="/employees/part-time">
                      <Button variant="ghost" size="sm" className="text-deep-blue">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <WorkLogTable logs={partTimeLogs.slice(0, 5)} showWorkerName={false} />
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Monthly Earnings
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Earnings"]}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={30}>
                          {monthlyData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === monthlyData.length - 1 ? "#0057B8" : "#3b82f6"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border bg-card p-6 shadow-soft">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                      <Briefcase className="h-5 w-5 text-indigo-500" />
                      Client History
                    </h3>
                    <div className="space-y-3">
                      {Array.from(new Set(partTimeLogs.map((l) => l.client_name)))
                        .slice(0, 5)
                        .map((client) => {
                          const clientLogs = partTimeLogs.filter((l) => l.client_name === client);
                          const total = clientLogs.reduce((sum, l) => sum + l.total_price, 0);
                          return (
                            <div
                              key={client}
                              className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <span className="font-medium text-dark-slate">{client}</span>
                              <span className="text-sm font-bold text-emerald-600">
                                ₹{total.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      {partTimeLogs.length === 0 && (
                        <p className="text-sm text-muted-foreground">No client history yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-card p-6 shadow-soft">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Payment History
                    </h3>
                    <div className="space-y-3">
                      {partTimeLogs
                        .filter((l) => l.advance_paid > 0)
                        .slice(0, 5)
                        .map((log) => (
                          <div
                            key={log.id}
                            className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100"
                          >
                            <div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.working_date), "MMM dd, yyyy")}
                              </div>
                              <div className="font-medium text-dark-slate">{log.client_name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-emerald-600">
                                ₹{log.advance_paid.toLocaleString()}
                              </div>
                              <PaymentStatusBadge status={log.payment_status} />
                            </div>
                          </div>
                        ))}
                      {partTimeLogs.filter((l) => l.advance_paid > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground">No payments logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold">Recent attendance</h3>
                  <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-10">
                    {attendance.length === 0 && (
                      <div className="col-span-full text-sm text-muted-foreground">
                        No attendance logged yet.
                      </div>
                    )}
                    {attendance.map((a) => (
                      <div
                        key={a.id}
                        title={`${a.date} — ${a.status}`}
                        className={`h-9 rounded-md text-center text-[10px] font-medium ${
                          a.status === "present"
                            ? "bg-success/20 text-success-foreground"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        <div className="pt-1">{a.date.slice(8)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold">Salary history</h3>
                  {salary.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No salary records yet.</p>
                  ) : (
                    <div className="mt-3 divide-y">
                      {salary.map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium">
                              {s.month}/{s.year}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {s.absent_days} absent · advance{" "}
                              {formatCurrency(Number(s.advance_salary))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(Number(s.final_salary))}
                            </div>
                            <Badge variant={s.payment_status === "paid" ? "default" : "secondary"}>
                              {s.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold">Advance salary</h3>
                  {advances.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No advances taken.</p>
                  ) : (
                    <div className="mt-3 divide-y">
                      {advances.map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium">{formatCurrency(Number(a.amount))}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.date} · {a.reason || "No reason"}
                            </div>
                          </div>
                          <Badge variant={a.settled ? "default" : "secondary"}>
                            {a.settled ? "Settled" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
