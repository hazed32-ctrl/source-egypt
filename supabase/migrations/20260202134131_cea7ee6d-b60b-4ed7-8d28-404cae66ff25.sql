-- Step 1: Extend app_role enum with new sales roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketer';