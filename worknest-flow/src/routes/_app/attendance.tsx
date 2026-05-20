import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*").eq("date", date);
      if (error) throw error;
      return data;
    },
  });

  const getStatus = (employeeId: string): "present" | "absent" => {
    const rec = attendance.find((a) => a.employee_id === employeeId);
    return (rec?.status as "present" | "absent") ?? "present"; // default present
  };

  const toggle = async (employeeId: string, present: boolean) => {
    const status = present ? "present" : "absent";
    const existing = attendance.find((a) => a.employee_id === employeeId);
    const { error } = existing
      ? await supabase.from("attendance").update({ status }).eq("id", existing.id)
      : await supabase.from("attendance").insert({ employee_id: employeeId, date, status });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["attendance", date] });
  };

  const present = employees.filter((e) => getStatus(e.id) === "present").length;
  const absent = employees.length - present;

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Employees are marked present by default. Toggle to mark absent."
        action={
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        }
      />
      <div className="p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Total</div>
            <div className="font-display text-2xl font-bold">{employees.length}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Present</div>
            <div className="font-display text-2xl font-bold text-success">{present}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="text-xs uppercase text-muted-foreground">Absent</div>
            <div className="font-display text-2xl font-bold text-destructive">{absent}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Present?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => {
                const isPresent = getStatus(e.id) === "present";
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={e.employee_type === "full_time" ? "default" : "secondary"}>
                        {e.employee_type === "full_time" ? "Full-time" : "Part-time"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPresent ? "default" : "destructive"}>
                        {isPresent ? "Present" : "Absent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch checked={isPresent} onCheckedChange={(v) => toggle(e.id, v)} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Add employees to start tracking attendance.
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
