-- Export production data from local database
-- This includes: brands, users with permissions, material_types

-- Insert brands (all 12 brands from local DB)
INSERT OR IGNORE INTO brands (id, name, display_name, description, color, logo_url, active, created_at) VALUES
(1, 'proteos-biotech', 'PROTEOS BIOTECH', 'Corporate Brand', '#1e3a8a', NULL, 1, datetime('now')),
(2, 'pbserum', 'pbserum', 'Main Product Brand', '#0ea5e9', NULL, 1, datetime('now')),
(3, 'waid', 'WAID', 'Professional skincare brand', '#8b5cf6', NULL, 1, datetime('now')),
(4, 'fibrorestil', 'FIBRORESTIL', 'Product Line', '#ec4899', NULL, 1, datetime('now')),
(9, 'pack_ha_15', 'Pack HA 1.5', 'Pack HA 1.5 - Hyaluronic Acid product line', '#0066cc', '', 1, datetime('now')),
(10, 'pack_ha_20', 'Pack HA 2.0', 'Pack HA 2.0 - Advanced Hyaluronic Acid product line', '#00a9e0', '', 1, datetime('now')),
(11, 'solutions_ha_20', 'Solutions HA 2.0', 'Solutions HA 2.0 - Hyaluronic Acid solutions', '#667eea', '', 1, datetime('now')),
(12, 'ha_corrector', 'HA CORRECTOR', 'HA CORRECTOR - Hyaluronic Acid corrector line', '#764ba2', '', 1, datetime('now')),
(13, 'shs30_high', 'SHS30+ HIGH', 'SHS30+ HIGH - High concentration formula', '#f59e0b', '', 1, datetime('now')),
(14, 'specific', 'SPECIFIC', 'SPECIFIC - Targeted treatment solutions', '#ef4444', '', 1, datetime('now')),
(15, 'plus', 'PLUS', 'PLUS - Premium product line', '#8b5cf6', '', 1, datetime('now')),
(16, 'smartker', 'SMARTKER', 'SMARTKER - Smart keratin technology', '#ec4899', '', 1, datetime('now'));

-- Insert admin user
INSERT OR IGNORE INTO users (email, password_hash, name, role, region, country, distributor, language, brands_access, active, created_at) 
VALUES ('admin@proteos.com', 'admin123', 'Administrator', 'admin', 'GLOBAL', 'Spain', 'Proteos Biotech', 'ENG', '[1,2,3,4,9,10,11,12,13,14,15,16]', 1, datetime('now'));

-- Insert material types (15 official categories)
INSERT OR IGNORE INTO material_types (id, name, display_name_en, display_name_es, description, icon, sort_order, active, created_at) VALUES
(1, 'brand_books', 'Brand Books', 'Guías de Marca', 'Manual de estilo de comunicación, claims e identidad visual', 'fa-book', 1, 1, datetime('now')),
(2, 'logo', 'Logo', 'Logotipo', 'Versiones oficiales de logotipo corporativo, de marcas y de producto', 'fa-trademark', 2, 1, datetime('now')),
(3, 'typography', 'Typography', 'Tipografía', 'Guía tipográfica oficial, con fuentes corporativas y de marcas', 'fa-font', 3, 1, datetime('now')),
(4, 'packshots', 'Packshots', 'Packshots', 'Imágenes oficiales de productos en alta resolución', 'fa-box-open', 4, 1, datetime('now')),
(5, 'images', 'Images', 'Imágenes', 'Banco de imágenes de marca: retratos, lifestyle, laboratorio', 'fa-images', 5, 1, datetime('now')),
(6, 'video', 'Video', 'Vídeos', 'Videos institucionales de producto o promocionales', 'fa-video', 6, 1, datetime('now')),
(7, 'slide_kits', 'Slide Kits', 'Presentaciones', 'Presentaciones de producto para reuniones y conferencias', 'fa-presentation-screen', 7, 1, datetime('now')),
(8, 'sales_materials', 'Sales Materials', 'Materiales Comerciales', 'Fichas técnicas, argumentarios de venta y brochures', 'fa-briefcase', 8, 1, datetime('now')),
(9, 'marketing', 'Marketing & Advertising', 'Marketing y Publicidad', 'Campañas de comunicación, anuncios, banners y materiales', 'fa-bullhorn', 9, 1, datetime('now')),
(10, 'training', 'Training Materials', 'Materiales de Formación', 'Guías, manuales y videos de formación', 'fa-graduation-cap', 10, 1, datetime('now')),
(11, 'medical', 'Medical Materials', 'Materiales Médicos', 'Artículos científicos, papers, estudios clínicos', 'fa-user-md', 11, 1, datetime('now')),
(12, 'events', 'Fairs & Events', 'Ferias y Eventos', 'Materiales y recursos para ferias o eventos', 'fa-calendar-alt', 12, 1, datetime('now')),
(13, 'social', 'Social Media', 'Redes Sociales', 'Imágenes, videos y textos listos para redes sociales', 'fa-share-alt', 13, 1, datetime('now')),
(14, 'press', 'Press & Media', 'Prensa y Medios', 'Notas de prensa, kits de medios y materiales para periodistas', 'fa-newspaper', 14, 1, datetime('now')),
(15, 'graphics', 'Icons & Graphic Elements', 'Iconos y Elementos Gráficos', 'Elementos visuales de apoyo: iconos, patrones, texturas', 'fa-icons', 15, 1, datetime('now'));
