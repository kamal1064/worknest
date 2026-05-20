import { supabase } from "@/integrations/supabase/client";
import {
  PartTimeWorker,
  PartTimeWorkLog,
  PartTimeWorkerFormValues,
  PartTimeWorkLogFormValues,
} from "@/types/part-time";

export const partTimeService = {
  // --- Workers ---

  async getWorkers() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("employee_type", "part_time")
      .order("full_name", { ascending: true });

    if (error) throw error;

    // Map database fields to UI type
    return (data || []).map((w) => ({
      ...w,
      phone_number: w.phone || "",
    })) as any as PartTimeWorker[];
  },

  async getWorkerById(id: string) {
    const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();

    if (error) throw error;

    return {
      ...data,
      phone_number: data.phone || "",
    } as any as PartTimeWorker;
  },

  async createWorker(values: PartTimeWorkerFormValues) {
    const payload = {
      full_name: values.full_name.trim(),
      phone: values.phone_number.trim() || null,
      age: values.age ? Number(values.age) : null,
      gender: values.gender as "male" | "female" | "other" | null,
      employee_type: "part_time" as const,
      salary: 0, // default or unused for part-time slab workers
    };

    const { data, error } = await supabase.from("employees").insert([payload]).select().single();

    if (error) throw error;

    return {
      ...data,
      phone_number: data.phone || "",
    } as any as PartTimeWorker;
  },

  async updateWorker(id: string, values: PartTimeWorkerFormValues) {
    const payload = {
      full_name: values.full_name.trim(),
      phone: values.phone_number.trim() || null,
      age: values.age ? Number(values.age) : null,
      gender: values.gender as "male" | "female" | "other" | null,
    };

    const { data, error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      phone_number: data.phone || "",
    } as any as PartTimeWorker;
  },

  async deleteWorker(id: string) {
    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) throw error;
  },

  // --- Work Logs ---

  async getWorkLogs(filters?: {
    worker_id?: string;
    client_name?: string;
    payment_status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from("part_time_work_logs")
      .select(
        `
        *,
        worker:employees(*)
      `,
      )
      .order("working_date", { ascending: false });

    if (filters?.worker_id) query = query.eq("worker_id", filters.worker_id);
    if (filters?.client_name) query = query.ilike("client_name", `%${filters.client_name}%`);
    if (filters?.payment_status) query = query.eq("payment_status", filters.payment_status);
    if (filters?.startDate) query = query.gte("working_date", filters.startDate);
    if (filters?.endDate) query = query.lte("working_date", filters.endDate);

    const { data, error } = await query;

    if (error) throw error;

    // Map phone to phone_number inside nested worker object for UI compatibility
    return (data || []).map((log) => ({
      ...log,
      payment_status: log.payment_status as any,
      worker: log.worker
        ? {
            ...log.worker,
            phone_number: (log.worker as any).phone || "",
          }
        : undefined,
    })) as unknown as PartTimeWorkLog[];
  },

  async createWorkLog(values: PartTimeWorkLogFormValues) {
    const { data, error } = await supabase
      .from("part_time_work_logs")
      .insert([values])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as PartTimeWorkLog;
  },

  async updateWorkLog(id: string, values: PartTimeWorkLogFormValues) {
    const { data, error } = await supabase
      .from("part_time_work_logs")
      .update(values as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as PartTimeWorkLog;
  },

  async deleteWorkLog(id: string) {
    const { error } = await supabase.from("part_time_work_logs").delete().eq("id", id);

    if (error) throw error;
  },

  // --- Clients ---

  async getRecentClients() {
    const { data, error } = await supabase
      .from("part_time_work_logs")
      .select("client_name")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get unique client names
    const clients = Array.from(new Set((data || []).map((log) => log.client_name)));
    return clients;
  },
};
