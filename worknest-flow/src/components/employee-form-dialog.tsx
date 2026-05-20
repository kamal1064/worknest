import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

export type Employee = {
  id: string;
  full_name: string;
  phone: string | null;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  salary: number;
  employee_type: "full_time" | "part_time";
  joining_date: string;
  profile_image: string | null;
};

interface Props {
  initial?: Employee;
  defaultType?: "full_time" | "part_time";
  trigger?: React.ReactNode;
}

export function EmployeeFormDialog({ initial, defaultType, trigger }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? "",
    phone: initial?.phone ?? "",
    age: initial?.age?.toString() ?? "",
    gender: (initial?.gender ?? "male") as "male" | "female" | "other",
    salary: initial?.salary?.toString() ?? "",
    employee_type: (initial?.employee_type ?? defaultType ?? "full_time") as
      | "full_time"
      | "part_time",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isPartTime = form.employee_type === "part_time";

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender,
      salary: isPartTime ? Number(form.salary || 0) : Number(form.salary),
      employee_type: form.employee_type,
    };

    const { error } = initial
      ? await supabase.from("employees").update(payload).eq("id", initial.id)
      : await supabase.from("employees").insert(payload);

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Employee updated" : "Employee added");
    qc.invalidateQueries({ queryKey: ["employees"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90">
            {initial ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add employee
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit employee" : "Add employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input
                type="number"
                min={16}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v as typeof form.gender })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employee type</Label>
              <Select
                value={form.employee_type}
                onValueChange={(v) =>
                  setForm({ ...form, employee_type: v as typeof form.employee_type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label>Monthly salary</Label>
              <Input
                type="number"
                min={0}
                required={form.employee_type === "full_time"}
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
