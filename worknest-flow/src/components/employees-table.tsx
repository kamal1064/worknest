import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { EmployeeFormDialog, type Employee } from "@/components/employee-form-dialog";
import { formatCurrency } from "@/lib/salary";
import { Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Props {
  filterType?: "full_time" | "part_time";
}

export function EmployeesTable({ filterType }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
  });

  const filtered = employees
    .filter((e) => !filterType || e.employee_type === filterType)
    .filter((e) => e.full_name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee? This cannot be undone.")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Employee deleted");
    qc.invalidateQueries({ queryKey: ["employees"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <EmployeeFormDialog defaultType={filterType} />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No employees yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={e.employee_type === "full_time" ? "default" : "secondary"}>
                      {e.employee_type === "full_time" ? "Full-time" : "Part-time"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.phone || "—"}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {e.gender || "—"}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(e.salary))}</TableCell>
                  <TableCell className="text-muted-foreground">{e.joining_date}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to="/employees/$id" params={{ id: e.id }}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <EmployeeFormDialog
                        initial={e}
                        trigger={
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4 hidden" />
                            <span className="sr-only">Edit</span>
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </Button>
                        }
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
