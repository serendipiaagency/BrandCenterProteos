-- Seed data for local development
-- Brands
INSERT OR IGNORE INTO brands (id, name, display_name, description, logo_url, color, active) VALUES
(1, 'proteos-biotech', 'PROTEOS BIOTECH', 'Proteos Biotech Main Brand', '', '#1e3a8a', 1),
(2, 'pbserum', 'pbserum', 'Main Product Brand', '', '#0ea5e9', 1),
(3, 'waid', 'WAID', 'Product Line', '', '#8b5cf6', 1),
(4, 'fibrorestil', 'FIBRORESTIL', 'Product Line', '', '#ec4899', 1),
(9, 'pack_ha_15', 'Pack HA 1.5', 'Pack HA 1.5 - Hyaluronic Acid product line', '', '#0066cc', 1),
(10, 'pack_ha_20', 'Pack HA 2.0', 'Pack HA 2.0 - Advanced Hyaluronic Acid product line', '', '#00a9e0', 1),
(11, 'solutions_ha_20', 'Solutions HA 2.0', 'Solutions HA 2.0 - Comprehensive Hyaluronic Acid solutions', '', '#667eea', 1),
(12, 'ha_corrector', 'HA CORRECTOR', 'HA CORRECTOR - Hyaluronic Acid corrector line', '', '#764ba2', 1),
(13, 'shs30_high', 'SHS30+ HIGH', 'SHS30+ HIGH - High concentration product line', '', '#f59e0b', 1),
(14, 'specific', 'SPECIFIC', 'SPECIFIC - Specialized product line', '', '#ef4444', 1),
(15, 'plus', 'PLUS', 'PLUS - Enhanced product range', '', '#8b5cf6', 1),
(16, 'smartker', 'SMARTKER', 'SMARTKER - Smart skin care technology', '', '#ec4899', 1);

-- Material Types
INSERT OR IGNORE INTO material_types (id, name, display_name_en, display_name_es, description, icon, sort_order, active) VALUES
(1, 'brand_books', 'Brand Books', 'Manuales de Marca', 'Brand guidelines and identity manuals', 'fa-book', 1, 1),
(2, 'logo', 'Logo', 'Logo', 'Brand logos and variations', 'fa-image', 2, 1),
(3, 'typography', 'Typography', 'Tipografía', 'Font families and text styles', 'fa-font', 3, 1),
(4, 'packshots', 'Packshots', 'Fotografías de Producto', 'Product photography and packshots', 'fa-camera', 4, 1),
(5, 'images', 'Images', 'Imágenes', 'Brand imagery and photography', 'fa-images', 5, 1),
(6, 'video', 'Video', 'Vídeo', 'Brand videos and motion graphics', 'fa-video', 6, 1),
(7, 'slide_kits', 'Slide Kits', 'Presentaciones', 'Presentation templates and decks', 'fa-presentation', 7, 1),
(8, 'sales_materials', 'Sales Materials', 'Material de Ventas', 'Sales collateral and brochures', 'fa-file-invoice', 8, 1),
(9, 'marketing_advertising', 'Marketing & Advertising', 'Marketing y Publicidad', 'Marketing campaigns and ads', 'fa-bullhorn', 9, 1),
(10, 'training_materials', 'Training Materials', 'Material de Formación', 'Educational and training resources', 'fa-graduation-cap', 10, 1),
(11, 'medical_materials', 'Medical Materials', 'Material Médico', 'Clinical and medical documentation', 'fa-notes-medical', 11, 1),
(12, 'fairs_events', 'Fairs & Events', 'Ferias y Eventos', 'Event materials and booth designs', 'fa-calendar-alt', 12, 1),
(13, 'social_media', 'Social Media', 'Redes Sociales', 'Social media assets and templates', 'fa-share-alt', 13, 1),
(14, 'press_media', 'Press & Media', 'Prensa y Medios', 'Press releases and media kits', 'fa-newspaper', 14, 1),
(15, 'icons_graphic_elements', 'Icons & Graphic Elements', 'Iconos y Elementos Gráficos', 'Icons, patterns and graphic assets', 'fa-shapes', 15, 1);

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, name, role, region, country, distributor, language, brands_access, active) VALUES
('admin@proteos.com', '$2b$10$rS8YJZxJZxJZxJZxJZxJZeN2mYqX3YqX3YqX3YqX3YqX3YqX3YqX3Y', 'Admin User', 'admin', 'Global', 'Spain', 'Proteos Biotech', 'ESP', '[]', 1);
