-- Enable Row Level Security (RLS)
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for passwords table
-- Allow public read access for password validation
CREATE POLICY "Allow public read access to passwords"
  ON passwords
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update/delete passwords
-- This ensures passwords can only be managed through Supabase Dashboard

-- Create RLS policies for request_history table
-- Allow public insert for logging requests
CREATE POLICY "Allow public insert to request_history"
  ON request_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow read access to request history
-- This policy can be adjusted based on your needs
CREATE POLICY "Allow public read to request_history"
  ON request_history
  FOR SELECT
  TO public
  USING (true);

-- Add comment about RLS
COMMENT ON POLICY "Allow public read access to passwords" ON passwords IS 'Allows anyone to verify passwords for authentication';
COMMENT ON POLICY "Allow public insert to request_history" ON request_history IS 'Allows logging of all song requests';
COMMENT ON POLICY "Allow public read to request_history" ON request_history IS 'Allows checking request history for rate limiting';