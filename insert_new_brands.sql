-- Insert new brands (excluding existing ones: pbserum, waid, fibrorestil, proteos-biotech)
-- These brands match the Excel column headers for brand permissions

-- Pack HA 1.5
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('pack_ha_15', 'Pack HA 1.5', 'Pack HA 1.5 - Hyaluronic Acid product line', '#0066cc', '', 1);

-- Pack HA 2.0
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('pack_ha_20', 'Pack HA 2.0', 'Pack HA 2.0 - Advanced Hyaluronic Acid product line', '#00a9e0', '', 1);

-- Solutions HA 2.0
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('solutions_ha_20', 'Solutions HA 2.0', 'Solutions HA 2.0 - Hyaluronic Acid solutions', '#667eea', '', 1);

-- HA CORRECTOR
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('ha_corrector', 'HA CORRECTOR', 'HA CORRECTOR - Hyaluronic Acid corrector line', '#764ba2', '', 1);

-- SHS30+ HIGH
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('shs30_high', 'SHS30+ HIGH', 'SHS30+ HIGH - High concentration formula', '#f59e0b', '', 1);

-- SPECIFIC
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('specific', 'SPECIFIC', 'SPECIFIC - Targeted treatment solutions', '#ef4444', '', 1);

-- PLUS
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('plus', 'PLUS', 'PLUS - Premium product line', '#8b5cf6', '', 1);

-- SMARTKER
INSERT INTO brands (name, display_name, description, color, logo_url, active) 
VALUES ('smartker', 'SMARTKER', 'SMARTKER - Smart keratin technology', '#ec4899', '', 1);
