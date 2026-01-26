-- Migration: Add many-to-many relationship for assets and brands
-- Date: 2026-01-26
-- Description: Allow assets to be available in multiple brands

-- Create asset_brands junction table
CREATE TABLE IF NOT EXISTS asset_brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  brand_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  UNIQUE(asset_id, brand_id)  -- Prevent duplicate assignments
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_asset_brands_asset_id ON asset_brands(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_brands_brand_id ON asset_brands(brand_id);

-- Migrate existing data from assets.brand_id to asset_brands
-- Only migrate assets that have a valid brand_id
INSERT INTO asset_brands (asset_id, brand_id)
SELECT id, brand_id 
FROM assets 
WHERE brand_id IS NOT NULL;

-- Note: We keep the brand_id column in assets for backward compatibility
-- but new functionality should use asset_brands table
