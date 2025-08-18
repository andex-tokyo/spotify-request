-- Create function to automatically delete old request history records
CREATE OR REPLACE FUNCTION delete_old_request_history()
RETURNS void AS $$
BEGIN
  -- Delete records older than 7 days
  DELETE FROM request_history
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION delete_old_request_history() IS 'Removes request history records older than 7 days to keep the table size manageable';

-- Note: To enable automatic cleanup, you can set up a cron job in Supabase:
-- 1. Enable pg_cron extension in your Supabase dashboard
-- 2. Run the following SQL to schedule daily cleanup at midnight:
-- SELECT cron.schedule(
--   'cleanup-request-history',
--   '0 0 * * *',
--   'SELECT delete_old_request_history();'
-- );