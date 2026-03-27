# Database Setup Guide

## Overview

This application uses Neon (Serverless PostgreSQL) as the database backend.

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
Tracks song request history for logging.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_ip | VARCHAR(255) | Client IP address (for logging) |
| track_uri | VARCHAR(255) | Spotify track URI |
| playlist_id | VARCHAR(255) | Target playlist ID |
| created_at | TIMESTAMP | Request time |

## Setup Instructions

1. Create a project at [Neon](https://neon.tech)
2. Run the following SQL in the SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password VARCHAR(255) UNIQUE NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS request_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_ip VARCHAR(255) NOT NULL,
  track_uri VARCHAR(255) NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_passwords_password ON passwords(password);
CREATE INDEX IF NOT EXISTS idx_request_history_client_ip ON request_history(client_ip);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at);
```

3. Copy the `DATABASE_URL` from Connection Details in the Neon dashboard
4. Set it in your `.env.local` file

## Adding Passwords

```sql
INSERT INTO passwords (password, playlist_id) VALUES
  ('your-password', 'spotify-playlist-id');
```
