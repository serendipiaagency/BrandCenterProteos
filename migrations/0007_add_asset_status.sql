-- Add status column to assets table
-- Default 'published' keeps all existing assets visible
ALTER TABLE assets ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
