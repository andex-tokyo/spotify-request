-- Create passwords table for storing authentication passwords and playlist mappings
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password VARCHAR(255) UNIQUE NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create request_history table for tracking request rate limits
CREATE TABLE IF NOT EXISTS request_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_ip VARCHAR(255) NOT NULL,
  track_uri VARCHAR(255) NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_passwords_password ON passwords(password);
CREATE INDEX IF NOT EXISTS idx_request_history_client_ip ON request_history(client_ip);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at);

-- Add comments for documentation
COMMENT ON TABLE passwords IS 'Stores authentication passwords and their associated Spotify playlist IDs';
COMMENT ON TABLE request_history IS 'Tracks request history for rate limiting purposes';
COMMENT ON COLUMN passwords.password IS 'Authentication password (should be unique)';
COMMENT ON COLUMN passwords.playlist_id IS 'Spotify playlist ID associated with this password';
COMMENT ON COLUMN request_history.client_ip IS 'Client IP address for tracking';
COMMENT ON COLUMN request_history.track_uri IS 'Spotify track URI that was requested';
COMMENT ON COLUMN request_history.playlist_id IS 'Target playlist ID for the request';