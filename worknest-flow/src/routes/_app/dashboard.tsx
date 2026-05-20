import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Users, UserCheck, UserCog, CalendarCheck, CalendarX, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/salary";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      return data;
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["attendance-today", today],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*").eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  const total = employees.length;
  const fullTime = employees.filter((e) => e.employee_type === "full_time").length;
  const partTime = employees.filter((e) => e.employee_type === "part_time").length;
  const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
  const presentToday = total - absentToday;
  const payroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);

  const stats = [
    { label: "Total employees", value: total, icon: Users, accent: "bg-gradient-brand" },
    { label: "Full-time", value: fullTime, icon: UserCheck, accent: "bg-gradient-brand" },
    { label: "Part-time", value: partTime, icon: UserCog, accent: "bg-gradient-success" },
    {
      label: "Present today",
      value: presentToday,
      icon: CalendarCheck,
      accent: "bg-gradient-success",
    },
    { label: "Absent today", value: absentToday, icon: CalendarX, accent: "bg-gradient-brand" },
    {
      label: "Monthly payroll",
      value: formatCurrency(payroll),
      icon: Wallet,
      accent: "bg-gradient-brand",
    },
  ];

  const typeData = [
    { name: "Full-time", value: fullTime, color: "var(--primary)" },
    { name: "Part-time", value: partTime, color: "var(--success)" },
  ];

  const attendanceData = [
    { name: "Present", value: presentToday },
    { name: "Absent", value: absentToday },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Workforce overview at a glance" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border bg-card p-5 shadow-soft"
            >
              <div
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.accent} text-primary-foreground shadow-elegant`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Workforce breakdown</h3>
            <p className="text-sm text-muted-foreground">Full-time vs part-time</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {typeData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Today's attendance</h3>
            <p className="text-sm text-muted-foreground">{today}</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
