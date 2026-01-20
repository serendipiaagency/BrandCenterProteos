-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, name, role, region, country, language) VALUES 
  ('admin@proteos.com', '$2a$10$rN8qJ.KZ9sZ8qZ8qZ8qZ8uO8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ', 'Administrator', 'admin', 'GLOBAL', 'N/A', 'ESP');

-- Insert brands from taxonomy
INSERT OR IGNORE INTO brands (name, display_name, description, color) VALUES 
  ('proteos-biotech', 'PROTEOS BIOTECH', 'Corporate Brand', '#1e3a8a'),
  ('pbserum', 'pbserum', 'Main Product Brand', '#0ea5e9'),
  ('waid', 'WAID', 'Product Line', '#8b5cf6'),
  ('fibrorestil', 'FIBRORESTIL', 'Product Line', '#ec4899');

-- Insert sub-brands
INSERT OR IGNORE INTO sub_brands (brand_id, name, display_name) VALUES 
  (2, 'ha', 'HA'),
  (2, 'reveal', 'REVEAL'),
  (2, 'ha-corrector', 'HA CORRECTOR'),
  (2, 'hyal-balance', 'HYAL BALANCE'),
  (2, 'plus', 'PLUS'),
  (2, 'specific', 'SPECIFIC'),
  (2, 'smartker', 'SMARTKER'),
  (2, 'veluria', 'VELURIA');

-- Insert material types
INSERT OR IGNORE INTO material_types (name, display_name_en, display_name_es, description, icon, sort_order) VALUES 
  ('brandbook', 'Brand Books', 'Guías de marca', 'Brand style guides and identity manuals', 'fa-book', 1),
  ('logo', 'Logo', 'Logo', 'Official logo versions in different formats', 'fa-trademark', 2),
  ('typography', 'Typography', 'Tipografía', 'Official typography and fonts', 'fa-font', 3),
  ('packshots', 'Packshots', 'Packshots', 'High-resolution product images', 'fa-box-open', 4),
  ('images', 'Images', 'Imágenes', 'Brand image library', 'fa-images', 5),
  ('video', 'Video', 'Video', 'Institutional and promotional videos', 'fa-video', 6),
  ('slide-kits', 'Slide Kits', 'Slide Kits', 'Product presentations', 'fa-presentation-screen', 7),
  ('sales-materials', 'Sales Materials', 'Materiales Comerciales', 'Sales sheets and brochures', 'fa-briefcase', 8),
  ('marketing', 'Marketing & Advertising', 'Marketing & Publicidad', 'Marketing campaigns and materials', 'fa-bullhorn', 9),
  ('training', 'Training Materials', 'Materiales Educación', 'Training guides and manuals', 'fa-graduation-cap', 10),
  ('medical', 'Medical Materials', 'Materiales Médicos', 'Clinical studies and medical documentation', 'fa-file-medical', 11),
  ('events', 'Fairs & Events', 'Ferias & Eventos', 'Trade show and event materials', 'fa-calendar-star', 12),
  ('social-media', 'Social Media', 'Social Media', 'Social media ready content', 'fa-share-nodes', 13),
  ('press', 'Press & Media', 'Prensa & Media', 'Press releases and media kits', 'fa-newspaper', 14),
  ('graphics', 'Icons & Graphic Elements', 'Iconos & Elementos Gráficos', 'Icons, patterns and graphic elements', 'fa-shapes', 15);
