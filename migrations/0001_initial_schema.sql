-- Users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'marketing', 'distributor', 'agency')),
  region TEXT,
  country TEXT,
  language TEXT DEFAULT 'ESP',
  brands_access TEXT, -- JSON array of brand IDs
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Brands table (Level 1)
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  color TEXT DEFAULT '#000000',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sub-brands table (Level 2)
CREATE TABLE IF NOT EXISTS sub_brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  UNIQUE(brand_id, name)
);

-- Material types table (Level 3)
CREATE TABLE IF NOT EXISTS material_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_name_en TEXT NOT NULL,
  display_name_es TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- Folders table for organizing assets
CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  brand_id INTEGER,
  sub_brand_id INTEGER,
  material_type_id INTEGER,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  FOREIGN KEY (sub_brand_id) REFERENCES sub_brands(id),
  FOREIGN KEY (material_type_id) REFERENCES material_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Assets table for files
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  title TEXT,
  description TEXT,
  file_type TEXT NOT NULL, -- pdf, jpg, png, mp4, zip, etc
  file_size INTEGER,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Taxonomy
  brand_id INTEGER,
  sub_brand_id INTEGER,
  material_type_id INTEGER,
  folder_id INTEGER,
  
  -- Metadata
  region TEXT,
  country TEXT,
  regulatory TEXT CHECK(regulatory IN ('EU', 'NON-EU', 'GLOBAL')),
  language TEXT,
  tags TEXT, -- JSON array
  
  -- Tracking
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  FOREIGN KEY (sub_brand_id) REFERENCES sub_brands(id),
  FOREIGN KEY (material_type_id) REFERENCES material_types(id),
  FOREIGN KEY (folder_id) REFERENCES folders(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- login, upload, download, delete, etc
  entity_type TEXT, -- asset, user, folder
  entity_id INTEGER,
  details TEXT, -- JSON
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_sub_brands_brand_id ON sub_brands(brand_id);
CREATE INDEX IF NOT EXISTS idx_folders_brand_id ON folders(brand_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_assets_brand_id ON assets(brand_id);
CREATE INDEX IF NOT EXISTS idx_assets_material_type ON assets(material_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
