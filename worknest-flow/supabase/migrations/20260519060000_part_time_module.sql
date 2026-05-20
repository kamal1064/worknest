-- Migration for Part-Time Worker Management Module
-- Updated to link with existing employees table

-- Create part_time_work_logs table
CREATE TABLE IF NOT EXISTS public.part_time_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    working_date DATE NOT NULL DEFAULT CURRENT_DATE,
    slab_quantity NUMERIC NOT NULL DEFAULT 0,
    slab_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC GENERATED ALWAYS AS (slab_quantity * slab_price) STORED,
    delivery_location TEXT,
    advance_paid NUMERIC NOT NULL DEFAULT 0,
    remaining_balance NUMERIC GENERATED ALWAYS AS (slab_quantity * slab_price - advance_paid) STORED,
    payment_status public.payment_status GENERATED ALWAYS AS (
        CASE 
            WHEN (slab_quantity * slab_price - advance_paid) <= 0 THEN 'paid'::public.payment_status
            WHEN advance_paid > 0 AND (slab_quantity * slab_price - advance_paid) > 0 THEN 'partial'::public.payment_status
            ELSE 'pending'::public.payment_status
        END
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add trigger for updated_at
CREATE TRIGGER set_part_time_work_logs_updated_at BEFORE UPDATE ON public.part_time_work_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.part_time_work_logs ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies matching other financial records
CREATE POLICY "Admins view part_time_work_logs" ON public.part_time_work_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage part_time_work_logs" ON public.part_time_work_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_part_time_work_logs_worker_id ON public.part_time_work_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_part_time_work_logs_working_date ON public.part_time_work_logs(working_date);
CREATE INDEX IF NOT EXISTS idx_part_time_work_logs_client_name ON public.part_time_work_logs(client_name);
