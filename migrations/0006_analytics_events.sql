-- Analytics Events Table
-- Tracks user interactions: views, downloads, shares

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,           -- 'view', 'download', 'share'
  asset_id INTEGER NOT NULL,
  asset_title TEXT,
  user_id INTEGER,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  user_region TEXT,
  brand_id INTEGER,
  brand_name TEXT,
  material_type TEXT,
  file_type TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  session_id TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_asset_id ON analytics_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_brand_id ON analytics_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(DATE(timestamp));

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_asset ON analytics_events(event_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_user ON analytics_events(event_type, user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_brand ON analytics_events(event_type, brand_id);
