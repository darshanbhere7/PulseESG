-- Migration script to add analysis_payload column to esg_analyses table
-- Run this SQL script on your PostgreSQL database

ALTER TABLE esg_analyses 
ADD COLUMN IF NOT EXISTS analysis_payload JSONB;

-- Update existing rows to have an empty JSON object if needed
UPDATE esg_analyses 
SET analysis_payload = '{}'::jsonb 
WHERE analysis_payload IS NULL;

-- Make the column NOT NULL after updating existing rows (optional)
-- ALTER TABLE esg_analyses ALTER COLUMN analysis_payload SET NOT NULL;

