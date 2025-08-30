-- Add theme column to settings table
ALTER TABLE public.settings 
ADD COLUMN theme text DEFAULT 'light'::text;