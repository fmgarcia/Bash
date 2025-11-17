-- Migración: Añadir columna company_id a la tabla scripts
-- Fecha: 2025-11-17
-- Descripción: Añade la columna company_id para soporte de scripts por empresa

USE gestion_scripts;

-- 1. Añadir columna company_id a la tabla scripts
ALTER TABLE scripts 
ADD COLUMN company_id INT UNSIGNED NULL AFTER updated_by;

-- 2. Crear índice para mejorar rendimiento en queries por empresa
ALTER TABLE scripts 
ADD INDEX idx_scripts_company (company_id);

-- 3. Añadir clave foránea (opcional, solo si quieres integridad referencial)
ALTER TABLE scripts 
ADD CONSTRAINT fk_scripts_company 
FOREIGN KEY (company_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verificar que se añadió correctamente
DESCRIBE scripts;

SELECT 'Migración completada exitosamente' AS resultado;
