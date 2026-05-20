-- Prevent deleting saved part-time work logs when a part-time worker is deleted
-- Change FK: part_time_work_logs.worker_id from ON DELETE CASCADE to ON DELETE RESTRICT

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT tc.constraint_name
  INTO v_constraint_name
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'part_time_work_logs'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name IN (
      SELECT tc2.constraint_name
      FROM information_schema.table_constraints tc2
      WHERE tc2.table_schema = 'public'
        AND tc2.table_name = 'part_time_work_logs'
    )
  LIMIT 1;

  -- More specific: fetch the FK that references public.employees
  SELECT tc.constraint_name
  INTO v_constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name
   AND kcu.table_schema = tc.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'part_time_work_logs'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'employees'
  ORDER BY tc.constraint_name
  LIMIT 1;

  IF v_constraint_name IS NULL THEN
    RAISE EXCEPTION 'FK constraint for part_time_work_logs.worker_id referencing public.employees not found';
  END IF;

  -- Drop and recreate the FK with RESTRICT
  EXECUTE format('ALTER TABLE public.part_time_work_logs DROP CONSTRAINT %I', v_constraint_name);

  EXECUTE '
    ALTER TABLE public.part_time_work_logs
    ADD CONSTRAINT part_time_work_logs_worker_id_fkey
    FOREIGN KEY (worker_id)
    REFERENCES public.employees(id)
    ON DELETE RESTRICT
  ';
END $$;
