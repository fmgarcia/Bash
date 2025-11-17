-- =====================================================
-- SCRIPT DE CORRECCIÓN DE NOMBRES DE COLUMNAS
-- Revierte los nombres para que coincidan con Prisma
-- Fecha: 2025-11-17
-- =====================================================

USE gestion_scripts;

SET FOREIGN_KEY_CHECKS=0;

-- =====================================================
-- REVERTIR NOMBRES DE COLUMNAS EN USERS
-- =====================================================

-- Verificar y renombrar password a password_hash
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password';

SET @sql = IF(@col_exists > 0,
  'ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL',
  'SELECT "La columna password_hash ya existe con el nombre correcto" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar active a is_active
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'active';

SET @sql = IF(@col_exists > 0,
  'ALTER TABLE users CHANGE COLUMN active is_active TINYINT(1) NOT NULL DEFAULT 1',
  'SELECT "La columna is_active ya existe con el nombre correcto" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar roleId a role_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'roleId';

SET @sql = IF(@col_exists > 0,
  'ALTER TABLE users CHANGE COLUMN roleId role_id TINYINT(3) UNSIGNED NOT NULL DEFAULT 2',
  'SELECT "La columna role_id ya existe con el nombre correcto" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS=1;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'CORRECCIÓN DE NOMBRES COMPLETADA' AS status;

DESCRIBE users;
