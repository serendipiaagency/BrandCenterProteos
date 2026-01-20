-- Insert new brands for Proteos Biotech Brand Portal
-- These brands match the Excel column headers for brand permissions

INSERT INTO brands (name, display_name, description, color, logo_url, active) VALUES
('pack_ha_15', 'Pack HA 1.5', 'Pack HA 1.5 - Hyaluronic Acid product line', '#0066cc', '', 1),
('pack_ha_20', 'Pack HA 2.0', 'Pack HA 2.0 - Advanced Hyaluronic Acid product line', '#00a9e0', '', 1),
('solutions_ha_20', 'Solutions HA 2.0', 'Solutions HA 2.0 - Hyaluronic Acid solutions', '#667eea', '', 1),
('ha_corrector', 'HA CORRECTOR', 'HA CORRECTOR - Hyaluronic Acid corrector line', '#764ba2', '', 1),
('waid', 'WAID', 'WAID - Professional skincare brand', '#10b981', '', 1),
('shs30_high', 'SHS30+ HIGH', 'SHS30+ HIGH - High concentration formula', '#f59e0b', '', 1),
('specific', 'SPECIFIC', 'SPECIFIC - Targeted treatment solutions', '#ef4444', '', 1),
('plus', 'PLUS', 'PLUS - Premium product line', '#8b5cf6', '', 1),
('smartker', 'SMARTKER', 'SMARTKER - Smart keratin technology', '#ec4899', '', 1);
