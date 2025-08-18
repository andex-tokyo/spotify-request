# Database Setup Guide

## Overview

This application uses Supabase as the database backend with PostgreSQL. The database schema is managed through migrations for version control and reproducibility.

## Database Structure

### Tables

#### `passwords`
Stores authentication passwords and their associated Spotify playlist IDs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| password | VARCHAR(255) | Unique authentication password |
| playlist_id | VARCHAR(255) | Associated Spotify playlist ID |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

#### `request_history`
Tracks song request history for rate limiting.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_ip | VARCHAR(255) | Client IP address (for logging) |
| track_uri | VARCHAR(255) | Spotify track URI |
| playlist_id | VARCHAR(255) | Target playlist ID |
| created_at | TIMESTAMP | Request time |

## Setup Instructions

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase (if not already done):
```bash
supabase init
```

3. Link to your remote project:
```bash
supabase link --project-ref your-project-ref
```

4. Run migrations:
```bash
supabase db push
```

5. (Optional) Seed sample data:
```bash
supabase db seed
```

### Option 2: Manual Setup via Dashboard

1. Go to your Supabase project's SQL Editor
2. Run each migration file in order:
   - `20240101000000_initial_schema.sql`
   - `20240101000001_enable_rls.sql`
   - `20240101000002_cleanup_function.sql`
3. Add your passwords manually in the Table Editor

## Adding Passwords

### Via SQL:
```sql
INSERT INTO passwords (password, playlist_id) VALUES 
  ('your-password', 'spotify-playlist-id');
```

### Via Supabase Dashboard:
1. Navigate to Table Editor
2. Select `passwords` table
3. Click "Insert row"
4. Add password and playlist_id

## Security

### Row Level Security (RLS)
- **passwords table**: Read-only access for authentication
- **request_history table**: Insert allowed for logging, read for rate limit checks

### Best Practices
1. Never commit real passwords to version control
2. Use environment-specific seed files
3. Regularly clean up old request_history records
4. Monitor database size and performance

## Maintenance

### Automatic Cleanup
Enable the cleanup cron job in Supabase:

```sql
-- Enable pg_cron extension first
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup
SELECT cron.schedule(
  'cleanup-request-history',
  '0 0 * * *',
  'SELECT delete_old_request_history();'
);
```

### Manual Cleanup
```sql
SELECT delete_old_request_history();
```

## Troubleshooting

### RLS Issues
If you encounter permission errors:
1. Check that RLS is enabled
2. Verify the policies are created
3. Ensure you're using the correct API keys

### Migration Errors
1. Check migration order
2. Verify database version compatibility
3. Review error logs in Supabase Dashboard