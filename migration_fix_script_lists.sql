-- Migración: Actualizar estructura de la tabla script_lists
-- Fecha: 2025-11-17
-- Descripción: Alinear la estructura de script_lists con el schema de Prisma

USE gestion_scripts;

-- 1. Renombrar created_by a user_id
ALTER TABLE script_lists 
CHANGE COLUMN created_by user_id INT UNSIGNED NOT NULL;

-- 2. Eliminar columna is_active (no se usa en el nuevo schema)
ALTER TABLE script_lists 
DROP COLUMN is_active;

-- 3. Añadir columnas faltantes
ALTER TABLE script_lists 
ADD COLUMN is_default TINYINT(1) NOT NULL DEFAULT 0 AFTER user_id,
ADD COLUMN color VARCHAR(20) NULL AFTER is_default,
ADD COLUMN icon VARCHAR(50) NULL AFTER color;

-- 4. Actualizar tipo de columna name
ALTER TABLE script_lists 
MODIFY COLUMN name VARCHAR(100) NOT NULL;

-- 5. Crear índice para user_id
ALTER TABLE script_lists 
ADD INDEX idx_script_lists_user (user_id);

-- 6. Añadir constraint unique para user_id + name
ALTER TABLE script_lists 
ADD CONSTRAINT uq_script_lists_user_name UNIQUE (user_id, name);

-- 7. Añadir clave foránea
ALTER TABLE script_lists 
ADD CONSTRAINT fk_script_lists_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Verificar estructura final
DESCRIBE script_lists;

SELECT 'Migración de script_lists completada exitosamente' AS resultado;
