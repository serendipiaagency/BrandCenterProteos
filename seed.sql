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

-- Insert material types (Proteos Biotech official categories)
INSERT OR IGNORE INTO material_types (name, display_name_en, display_name_es, description, icon, sort_order) VALUES 
  ('brand_books', 'Brand Books', 'Guías de Marca', 'Manual de estilo de comunicacion, claims e identidad visual de pbserum', 'fa-book', 1),
  ('logo', 'Logo', 'Logo', 'Versiones oficiales de logotipo corporativo, de marcas y de producto en distintos formatos, colores y usos permitidos.', 'fa-trademark', 2),
  ('typography', 'Typography', 'Tipografía', 'Guía tipográfica oficial, con fuentes corporativas y de marcas.', 'fa-font', 3),
  ('packshots', 'Packshots', 'Packshots', 'Imágenes oficiales de productos en alta resolución, listas para catálogos, fichas o materiales promocionales.', 'fa-box-open', 4),
  ('images', 'Images', 'Imágenes', 'Banco de imágenes de marca: retratos, lifestyle, laboratorio, instalaciones y equipo.', 'fa-images', 5),
  ('video', 'Video', 'Video', 'Videos institucionales de producto o promocionales listos para comunicación interna o externa.', 'fa-video', 6),
  ('slide_kits', 'Slide Kits', 'Presentaciones', 'Presentaciones de producto para uso en reuniones, formaciones o conferencias.', 'fa-presentation-screen', 7),
  ('sales_materials', 'Sales Materials', 'Materiales Comerciales', 'Materiales comerciales como fichas técnicas, argumentarios de venta y brochures.', 'fa-briefcase', 8),
  ('marketing_advertising', 'Marketing & Advertising', 'Marketing & Publicidad', 'Campañas de comunicación, anuncios, banners, posters y materiales de marketing aprobados.', 'fa-bullhorn', 9),
  ('training_materials', 'Training Materials', 'Materiales Educación', 'Guías, manuales y videos de formación dirigidos a equipos internos o partners profesionales.', 'fa-graduation-cap', 10),
  ('medical_materials', 'Medical Materials', 'Materiales Médicos', 'Artículos científicos, papers, estudios clínicos y documentación técnica avalada por el equipo médico.', 'fa-user-md', 11),
  ('fairs_events', 'Fairs & Events', 'Ferias & Eventos', 'Materiales y recursos para ferias o eventos: stands, roll-ups y elementos visuales.', 'fa-calendar-alt', 12),
  ('social_media', 'Social Media', 'Social Media', 'Imágenes, videos y textos listos para redes sociales', 'fa-share-alt', 13),
  ('press_media', 'Press & Media', 'Prensa & Media', 'Notas de prensa, kits de medios, apariciones en prensa y materiales para periodistas.', 'fa-newspaper', 14),
  ('icons_graphics', 'Icons & Graphic Elements', 'Iconos & Elementos Gráficos', 'Elementos visuales de apoyo: iconos, patrones, texturas y gráficos aprobados para uso de marca.', 'fa-icons', 15);
