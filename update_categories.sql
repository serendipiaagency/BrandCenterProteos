-- ============================================
-- Update Material Types with Proteos Categories
-- ============================================

-- Clear existing material types
DELETE FROM material_types;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name='material_types';

-- Insert new material types
INSERT INTO material_types (name, display_name_en, display_name_es, description, icon, sort_order, active) VALUES
('brand_books', 'Brand Books', 'Guías de Marca', 'Manual de estilo de comunicacion, claims e identidad visual de pbserum', 'fa-book', 1, 1),
('logo', 'Logo', 'Logo', 'Versiones oficiales de logotipo corporativo, de marcas y de producto en distintos formatos, colores y usos permitidos.', 'fa-trademark', 2, 1),
('typography', 'Typography', 'Tipografía', 'Guía tipográfica oficial, con fuentes corporativas y de marcas.', 'fa-font', 3, 1),
('packshots', 'Packshots', 'Packshots', 'Imágenes oficiales de productos en alta resolución, listas para catálogos, fichas o materiales promocionales.', 'fa-box-open', 4, 1),
('images', 'Images', 'Imágenes', 'Banco de imágenes de marca: retratos, lifestyle, laboratorio, instalaciones y equipo.', 'fa-images', 5, 1),
('video', 'Video', 'Video', 'Videos institucionales de producto o promocionales listos para comunicación interna o externa.', 'fa-video', 6, 1),
('slide_kits', 'Slide Kits', 'Presentaciones', 'Presentaciones de producto para uso en reuniones, formaciones o conferencias.', 'fa-presentation-screen', 7, 1),
('sales_materials', 'Sales Materials', 'Materiales Comerciales', 'Materiales comerciales como fichas técnicas, argumentarios de venta y brochures.', 'fa-briefcase', 8, 1),
('marketing_advertising', 'Marketing & Advertising', 'Marketing & Publicidad', 'Campañas de comunicación, anuncios, banners, posters y materiales de marketing aprobados.', 'fa-bullhorn', 9, 1),
('training_materials', 'Training Materials', 'Materiales Educación', 'Guías, manuales y videos de formación dirigidos a equipos internos o partners profesionales.', 'fa-graduation-cap', 10, 1),
('medical_materials', 'Medical Materials', 'Materiales Médicos', 'Artículos científicos, papers, estudios clínicos y documentación técnica avalada por el equipo médico.', 'fa-user-md', 11, 1),
('fairs_events', 'Fairs & Events', 'Ferias & Eventos', 'Materiales y recursos para ferias o eventos: stands, roll-ups y elementos visuales.', 'fa-calendar-alt', 12, 1),
('social_media', 'Social Media', 'Social Media', 'Imágenes, videos y textos listos para redes sociales', 'fa-share-alt', 13, 1),
('press_media', 'Press & Media', 'Prensa & Media', 'Notas de prensa, kits de medios, apariciones en prensa y materiales para periodistas.', 'fa-newspaper', 14, 1),
('icons_graphics', 'Icons & Graphic Elements', 'Iconos & Elementos Gráficos', 'Elementos visuales de apoyo: iconos, patrones, texturas y gráficos aprobados para uso de marca.', 'fa-icons', 15, 1);
