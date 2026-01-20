-- Production seed - simplified version
-- Insert brands
INSERT OR IGNORE INTO brands (id, name, display_name, description, color, active) VALUES
(1, 'proteos-biotech', 'PROTEOS BIOTECH', 'Corporate Brand', '#1e3a8a', 1),
(2, 'pbserum', 'pbserum', 'Main Product Brand', '#0ea5e9', 1),
(3, 'waid', 'WAID', 'Professional skincare brand', '#8b5cf6', 1),
(4, 'fibrorestil', 'FIBRORESTIL', 'Product Line', '#ec4899', 1),
(9, 'pack_ha_15', 'Pack HA 1.5', 'Pack HA 1.5 - Hyaluronic Acid product line', '#0066cc', 1),
(10, 'pack_ha_20', 'Pack HA 2.0', 'Pack HA 2.0 - Advanced Hyaluronic Acid product line', '#00a9e0', 1),
(11, 'solutions_ha_20', 'Solutions HA 2.0', 'Solutions HA 2.0 - Hyaluronic Acid solutions', '#667eea', 1),
(12, 'ha_corrector', 'HA CORRECTOR', 'HA CORRECTOR - Hyaluronic Acid corrector line', '#764ba2', 1),
(13, 'shs30_high', 'SHS30+ HIGH', 'SHS30+ HIGH - High concentration formula', '#f59e0b', 1),
(14, 'specific', 'SPECIFIC', 'SPECIFIC - Targeted treatment solutions', '#ef4444', 1),
(15, 'plus', 'PLUS', 'PLUS - Premium product line', '#8b5cf6', 1),
(16, 'smartker', 'SMARTKER', 'SMARTKER - Smart keratin technology', '#ec4899', 1);

-- Insert admin user
INSERT OR IGNORE INTO users (email, password_hash, name, role, region, country, distributor, language, brands_access, active) 
VALUES ('admin@proteos.com', 'admin123', 'Administrator', 'admin', 'GLOBAL', 'Spain', 'Proteos Biotech', 'ENG', '[1,2,3,4,9,10,11,12,13,14,15,16]', 1);

-- Insert material types
INSERT OR IGNORE INTO material_types (id, name, display_name_en, display_name_es, description, icon, sort_order, active) VALUES
(1, 'brand_books', 'Brand Books', 'Guías de Marca', 'Manual de estilo de comunicación', 'fa-book', 1, 1),
(2, 'logo', 'Logo', 'Logotipo', 'Versiones oficiales de logotipo', 'fa-trademark', 2, 1),
(3, 'typography', 'Typography', 'Tipografía', 'Guía tipográfica oficial', 'fa-font', 3, 1),
(4, 'packshots', 'Packshots', 'Packshots', 'Imágenes oficiales de productos', 'fa-box-open', 4, 1),
(5, 'images', 'Images', 'Imágenes', 'Banco de imágenes de marca', 'fa-images', 5, 1),
(6, 'video', 'Video', 'Vídeos', 'Videos institucionales', 'fa-video', 6, 1),
(7, 'slide_kits', 'Slide Kits', 'Presentaciones', 'Presentaciones de producto', 'fa-presentation-screen', 7, 1),
(8, 'sales_materials', 'Sales Materials', 'Materiales Comerciales', 'Fichas técnicas y brochures', 'fa-briefcase', 8, 1),
(9, 'marketing', 'Marketing & Advertising', 'Marketing y Publicidad', 'Campañas de comunicación', 'fa-bullhorn', 9, 1),
(10, 'training', 'Training Materials', 'Materiales de Formación', 'Guías y manuales', 'fa-graduation-cap', 10, 1),
(11, 'medical', 'Medical Materials', 'Materiales Médicos', 'Artículos científicos', 'fa-user-md', 11, 1),
(12, 'events', 'Fairs & Events', 'Ferias y Eventos', 'Materiales para eventos', 'fa-calendar-alt', 12, 1),
(13, 'social', 'Social Media', 'Redes Sociales', 'Contenido para redes', 'fa-share-alt', 13, 1),
(14, 'press', 'Press & Media', 'Prensa y Medios', 'Kits de medios', 'fa-newspaper', 14, 1),
(15, 'graphics', 'Icons & Graphic Elements', 'Iconos y Elementos Gráficos', 'Elementos visuales', 'fa-icons', 15, 1);
