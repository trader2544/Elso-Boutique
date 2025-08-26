
-- Create testimonials table for user testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all testimonials
CREATE POLICY "Anyone can view testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (true);

-- Policy for users to create their own testimonials
CREATE POLICY "Users can create testimonials" 
  ON public.testimonials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own testimonials
CREATE POLICY "Users can update their own testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own testimonials
CREATE POLICY "Users can delete their own testimonials" 
  ON public.testimonials 
  FOR DELETE 
  USING (auth.uid() = user_id);
