-- ============================================================================
-- MIGRACIÓN COMPLETA: Alinear todas las tablas con el schema de Prisma
-- Fecha: 2025-11-17
-- Descripción: Corrige la estructura de script_lists y script_list_items
-- ============================================================================

USE gestion_scripts;

-- ============================================================================
-- PARTE 1: Arreglar tabla script_lists
-- ============================================================================

-- 1.1. Eliminar constraints y claves foráneas existentes
ALTER TABLE script_lists DROP FOREIGN KEY IF EXISTS fk_script_lists_created_by;
ALTER TABLE script_lists DROP INDEX IF EXISTS fk_script_lists_created_by;

-- 1.2. Renombrar created_by a user_id
ALTER TABLE script_lists 
CHANGE COLUMN created_by user_id INT UNSIGNED NOT NULL;

-- 1.3. Eliminar columna is_active (no existe en el schema Prisma)
ALTER TABLE script_lists 
DROP COLUMN IF EXISTS is_active;

-- 1.4. Añadir columnas faltantes
ALTER TABLE script_lists 
ADD COLUMN IF NOT EXISTS is_default TINYINT(1) NOT NULL DEFAULT 0 AFTER user_id,
ADD COLUMN IF NOT EXISTS color VARCHAR(20) NULL AFTER is_default,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) NULL AFTER color;

-- 1.5. Actualizar tipo de columna name
ALTER TABLE script_lists 
MODIFY COLUMN name VARCHAR(100) NOT NULL;

-- 1.6. Crear índice para user_id
ALTER TABLE script_lists 
ADD INDEX IF NOT EXISTS idx_script_lists_user (user_id);

-- 1.7. Añadir constraint unique (primero eliminar si existe)
ALTER TABLE script_lists DROP INDEX IF EXISTS uq_script_lists_user_name;
ALTER TABLE script_lists 
ADD CONSTRAINT uq_script_lists_user_name UNIQUE (user_id, name);

-- 1.8. Añadir nueva clave foránea
ALTER TABLE script_lists 
ADD CONSTRAINT fk_script_lists_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ============================================================================
-- PARTE 2: Arreglar tabla script_list_items
-- ============================================================================

-- 2.1. Eliminar claves foráneas existentes
ALTER TABLE script_list_items DROP FOREIGN KEY IF EXISTS fk_script_list_items_list;
ALTER TABLE script_list_items DROP FOREIGN KEY IF EXISTS fk_script_list_items_script;

-- 2.2. Eliminar columnas que no existen en el schema Prisma
ALTER TABLE script_list_items DROP COLUMN IF EXISTS order_index;
ALTER TABLE script_list_items DROP COLUMN IF EXISTS is_favorite;

-- 2.3. Añadir columna notes si no existe
ALTER TABLE script_list_items 
ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER added_at;

-- 2.4. Cambiar tipo de id a BIGINT UNSIGNED (si no lo es ya)
ALTER TABLE script_list_items 
MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- 2.5. Eliminar índices antiguos si existen
ALTER TABLE script_list_items DROP INDEX IF EXISTS idx_script_list_items_list;
ALTER TABLE script_list_items DROP INDEX IF EXISTS idx_script_list_items_script;
ALTER TABLE script_list_items DROP INDEX IF EXISTS uq_script_list_items_list_script;

-- 2.6. Crear índices correctos
ALTER TABLE script_list_items 
ADD INDEX idx_script_list_items_list (list_id),
ADD INDEX idx_script_list_items_script (script_id);

-- 2.7. Añadir constraint unique
ALTER TABLE script_list_items 
ADD CONSTRAINT uq_script_list_items_list_script UNIQUE (list_id, script_id);

-- 2.8. Añadir claves foráneas
ALTER TABLE script_list_items 
ADD CONSTRAINT fk_script_list_items_list 
FOREIGN KEY (list_id) REFERENCES script_lists(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE script_list_items 
ADD CONSTRAINT fk_script_list_items_script 
FOREIGN KEY (script_id) REFERENCES scripts(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '============================================================' AS '';
SELECT 'VERIFICACIÓN DE ESTRUCTURAS' AS '';
SELECT '============================================================' AS '';

SELECT '' AS '';
SELECT 'Estructura de script_lists:' AS '';
DESCRIBE script_lists;

SELECT '' AS '';
SELECT 'Estructura de script_list_items:' AS '';
DESCRIBE script_list_items;

SELECT '' AS '';
SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' AS resultado;
