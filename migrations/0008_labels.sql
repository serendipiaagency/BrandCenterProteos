-- Labels system: reusable badges that can be assigned to assets
CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: many-to-many between assets and labels
CREATE TABLE IF NOT EXISTS asset_labels (
  asset_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  PRIMARY KEY (asset_id, label_id),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asset_labels_asset ON asset_labels(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_labels_label ON asset_labels(label_id);

-- Default labels
INSERT OR IGNORE INTO labels (name, color, text_color) VALUES ('Nuevo', '#10b981', '#ffffff');
INSERT OR IGNORE INTO labels (name, color, text_color) VALUES ('Actualizado', '#3b82f6', '#ffffff');
INSERT OR IGNORE INTO labels (name, color, text_color) VALUES ('Destacado', '#f59e0b', '#1a202c');
INSERT OR IGNORE INTO labels (name, color, text_color) VALUES ('Oferta', '#ef4444', '#ffffff');
