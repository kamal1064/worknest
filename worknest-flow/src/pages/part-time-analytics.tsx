import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partTimeService } from "@/services/part-time";
import { AnalyticsDashboardCards } from "@/components/part-time/analytics-cards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";

const COLORS = ["#0057B8", "#0EA5FF", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function PartTimeAnalytics() {
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["part-time-work-logs"],
    queryFn: () => partTimeService.getWorkLogs(),
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["part-time-workers"],
    queryFn: () => partTimeService.getWorkers(),
  });

  if (logsLoading || workersLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-blue" />
      </div>
    );
  }

  // --- Calculate Stats ---
  const totalPaid = logs.reduce((sum, log) => sum + log.advance_paid, 0);
  const totalBalance = logs.reduce((sum, log) => sum + log.remaining_balance, 0);
  const activeClients = new Set(logs.map((log) => log.client_name)).size;

  const now = new Date();
  const currentMonth = startOfMonth(now);
  const monthlyLogs = logs.filter((log) => new Date(log.working_date) >= currentMonth);
  const monthlyEarnings = monthlyLogs.reduce((sum, log) => sum + log.total_price, 0);

  const stats = {
    totalWorkers: workers.length,
    totalWorkEntries: logs.length,
    totalPaidAmount: totalPaid,
    pendingPayments: totalBalance,
    activeClients: activeClients,
    monthlyEarnings: monthlyEarnings,
  };

  // --- Chart Data: Monthly Trends ---
  const last6Months = Array.from({ length: 6 })
    .map((_, i) => {
      const date = subMonths(now, i);
      const monthStr = format(date, "MMM");
      const monthStart = startOfMonth(date);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const amount = logs
        .filter((log) => {
          const d = new Date(log.working_date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, log) => sum + log.total_price, 0);

      return { month: monthStr, amount };
    })
    .reverse();

  // --- Chart Data: Top Clients (by payout) ---
  const topClients = Object.entries(
    logs.reduce(
      (acc, log) => {
        acc[log.client_name] = (acc[log.client_name] || 0) + log.total_price;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // --- Chart Data: Workforce Allocation (by client) ---
  const workforceAllocation = Object.entries(
    logs.reduce(
      (acc, log) => {
        if (!acc[log.client_name]) acc[log.client_name] = new Set();
        acc[log.client_name].add(log.worker_id);
        return acc;
      },
      {} as Record<string, Set<string>>,
    ),
  )
    .map(([name, workers]) => ({ name, count: workers.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // --- Chart Data: Client Productivity (Slabs) ---
  const clientProductivity = Object.entries(
    logs.reduce(
      (acc, log) => {
        acc[log.client_name] = (acc[log.client_name] || 0) + Number(log.slab_quantity);
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, slabs]) => ({ name, slabs }))
    .sort((a, b) => b.slabs - a.slabs)
    .slice(0, 6);

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-dark-slate tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Performance overview for part-time operations</p>
      </div>

      <AnalyticsDashboardCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Clients Chart */}
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top clients by payout</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Total Payout"]}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={35}>
                  {topClients.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workforce Allocation Chart */}
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Workforce allocation by client</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workforceAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {workforceAllocation.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [`${value} Workers`, "Allocation"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {workforceAllocation.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Client Expenses Chart */}
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly client expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5FF" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0EA5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Expenses"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0EA5FF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client-wise Slab Productivity Chart */}
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Client-wise slab productivity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientProductivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [`${value} Slabs`, "Productivity"]}
                />
                <Bar dataKey="slabs" radius={[0, 4, 4, 0]} barSize={25} fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
