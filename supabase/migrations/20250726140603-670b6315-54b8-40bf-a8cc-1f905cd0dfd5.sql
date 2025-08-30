-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create RLS policies for documents bucket
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add additional columns to documents table for enhanced functionality
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS renewal_date DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE documents ADD COLUMN IF NOT EXISTS encryption_key TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_documents_renewal_date ON documents(renewal_date) WHERE renewal_date IS NOT NULL;