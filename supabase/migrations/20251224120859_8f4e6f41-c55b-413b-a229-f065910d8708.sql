-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a weekly cron job to cleanup old content (runs every Sunday at 2 AM)
SELECT cron.schedule(
  'weekly-content-cleanup',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
        url:='https://gfwjynhbmpdgvacutyab.supabase.co/functions/v1/cleanup-old-content',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmd2p5bmhibXBkZ3ZhY3V0eWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjczNDEsImV4cCI6MjA4MTk0MzM0MX0.sjhIAVaLHH1JHcPm7StieaqW84NXo9cdO5XGeCiqPtM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);