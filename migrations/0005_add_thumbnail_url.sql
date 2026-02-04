-- Migration: Add thumbnail_url column to assets table
-- This is a non-destructive migration that adds an optional thumbnail field
-- Existing assets will have NULL thumbnail_url and will work exactly as before

-- Add thumbnail_url column (nullable - safe for existing data)
ALTER TABLE assets ADD COLUMN thumbnail_url TEXT DEFAULT NULL;

-- No data modification - existing assets remain unchanged
-- Assets without thumbnail will use current behavior (icons/original images)
