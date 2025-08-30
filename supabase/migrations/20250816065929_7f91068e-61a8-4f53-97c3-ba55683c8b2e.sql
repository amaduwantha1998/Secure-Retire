-- Create translations table for caching API translations
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations (public read, system write)
CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage translations" 
ON public.translations 
FOR ALL 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_translations_key_language ON public.translations(key, language);

-- Create function to update timestamps
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();