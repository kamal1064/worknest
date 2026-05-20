import { z } from "zod";

// --- Database Row Types ---

export interface PartTimeWorker {
  id: string;
  full_name: string;
  phone_number: string;
  age?: number | null;
  gender?: string | null;
  created_at: string;
}

export type PaymentStatus = "Paid" | "Partial" | "Pending";

export interface PartTimeWorkLog {
  id: string;
  worker_id: string;
  client_name: string;
  working_date: string;
  slab_quantity: number;
  slab_price: number;
  total_price: number;
  delivery_location?: string | null;
  advance_paid: number;
  remaining_balance: number;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  // Joined field
  worker?: PartTimeWorker;
}

// --- Zod Schemas for Validation ---

export const partTimeWorkerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().min(1, "Age must be a positive number").optional().nullable(),
  gender: z.string().optional().nullable(),
});

export type PartTimeWorkerFormValues = z.infer<typeof partTimeWorkerSchema>;

export const partTimeWorkLogSchema = z.object({
  worker_id: z.string().uuid("Please select a worker"),
  client_name: z.string().min(2, "Client name must be at least 2 characters"),
  working_date: z.string().min(1, "Working date is required"),
  slab_quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  slab_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  delivery_location: z.string().optional().nullable(),
  advance_paid: z.coerce.number().min(0, "Advance cannot be negative"),
  notes: z.string().optional().nullable(),
});

export type PartTimeWorkLogFormValues = z.infer<typeof partTimeWorkLogSchema>;

// --- Analytics Types ---

export interface PartTimeAnalytics {
  totalWorkers: number;
  totalWorkEntries: number;
  totalPaidAmount: number;
  pendingPayments: number;
  activeClients: number;
  monthlyEarnings: { month: string; amount: number }[];
  topClients: { name: string; total: number }[];
  workerProductivity: { name: string; slabs: number }[];
}
