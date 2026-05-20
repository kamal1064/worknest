import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, Clock, TrendingUp, Briefcase } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
}) => (
  <Card className="overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-dark-slate">{value}</div>
      {(description || trend) && (
        <div className="flex items-center mt-1">
          {trend && (
            <span
              className={`text-xs font-medium mr-2 ${trend.isUp ? "text-emerald-600" : "text-rose-600"}`}
            >
              {trend.isUp ? "+" : "-"}
              {trend.value}%
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface AnalyticsDashboardCardsProps {
  stats: {
    totalWorkers: number;
    totalWorkEntries: number;
    totalPaidAmount: number;
    pendingPayments: number;
    activeClients: number;
    monthlyEarnings: number;
  };
}

export const AnalyticsDashboardCards: React.FC<AnalyticsDashboardCardsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <AnalyticsCard
        title="Total Workers"
        value={stats.totalWorkers}
        icon={Users}
        color="bg-deep-blue"
        description="Active part-time"
      />
      <AnalyticsCard
        title="Total Entries"
        value={stats.totalWorkEntries}
        icon={FileText}
        color="bg-tech-blue"
        description="Lifetime logs"
      />
      <AnalyticsCard
        title="Total Paid"
        value={`₹${stats.totalPaidAmount.toLocaleString()}`}
        icon={CheckCircle2}
        color="bg-emerald-500"
        description="Confirmed payments"
      />
      <AnalyticsCard
        title="Pending"
        value={`₹${stats.pendingPayments.toLocaleString()}`}
        icon={Clock}
        color="bg-rose-500"
        description="Awaiting settlement"
      />
      <AnalyticsCard
        title="Monthly Revenue"
        value={`₹${stats.monthlyEarnings.toLocaleString()}`}
        icon={TrendingUp}
        color="bg-indigo-500"
        description="Current month"
      />
      <AnalyticsCard
        title="Active Clients"
        value={stats.activeClients}
        icon={Briefcase}
        color="bg-amber-500"
        description="Recent partnerships"
      />
    </div>
  );
};
