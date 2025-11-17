-- =====================================================
-- SCRIPT DE MIGRACIÓN DE BASE DE DATOS
-- Actualiza la estructura sin perder datos
-- Fecha: 2025-11-17
-- =====================================================

-- Usar la base de datos
USE gestion_scripts;

-- Deshabilitar foreign key checks temporalmente para facilitar modificaciones
SET FOREIGN_KEY_CHECKS=0;

-- =====================================================
-- 1. TABLA: audit_trail
-- =====================================================
CREATE TABLE IF NOT EXISTS `audit_trail` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` int(10) unsigned DEFAULT NULL,
  `performed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity`,`entity_id`),
  KEY `fk_audit_performed_by` (`performed_by`),
  CONSTRAINT `fk_audit_performed_by` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA: script_lists (Listas de scripts)
-- =====================================================
CREATE TABLE IF NOT EXISTS `script_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_script_lists_created_by` (`created_by`),
  CONSTRAINT `fk_script_lists_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA: script_list_items (Items de listas)
-- =====================================================
CREATE TABLE IF NOT EXISTS `script_list_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list_id` int(10) unsigned NOT NULL,
  `script_id` int(10) unsigned NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `is_favorite` tinyint(1) NOT NULL DEFAULT 0,
  `added_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_list_script` (`list_id`,`script_id`),
  KEY `fk_list_items_script` (`script_id`),
  CONSTRAINT `fk_list_items_list` FOREIGN KEY (`list_id`) REFERENCES `script_lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_list_items_script` FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA: script_versions (Versiones de scripts)
-- =====================================================
CREATE TABLE IF NOT EXISTS `script_versions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `script_id` int(10) unsigned NOT NULL,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sv_script_id` (`script_id`),
  KEY `fk_sv_created_by` (`created_by`),
  CONSTRAINT `fk_sv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sv_script` FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. MODIFICAR TABLA: users (Añadir company_id)
-- =====================================================

-- Verificar si la columna company_id existe, si no, añadirla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'company_id';

-- Añadir company_id si no existe
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN company_id INT(10) UNSIGNED NULL AFTER role_id',
  'SELECT "La columna company_id ya existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si la columna full_name existe, si no, añadirla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'full_name';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN full_name VARCHAR(255) COLLATE utf8mb4_unicode_ci NULL AFTER company_id',
  'SELECT "La columna full_name ya existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 6. AÑADIR ÍNDICES Y FOREIGN KEYS FALTANTES
-- =====================================================

-- Índice para company_id si no existe
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND INDEX_NAME = 'idx_users_company';

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_users_company ON users(company_id)',
  'SELECT "El índice idx_users_company ya existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign key para company_id si no existe
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND CONSTRAINT_NAME = 'fk_users_company';

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT "La foreign key fk_users_company ya existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 7. VERIFICAR Y CORREGIR NOMBRES DE COLUMNAS
-- =====================================================

-- Renombrar password_hash a password si es necesario (para compatibilidad con Prisma)
SET @col_exists_old = 0;
SET @col_exists_new = 0;

SELECT COUNT(*) INTO @col_exists_old 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password_hash';

SELECT COUNT(*) INTO @col_exists_new 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password';

-- Si existe password_hash pero no password, renombrar
SET @sql = IF(@col_exists_old > 0 AND @col_exists_new = 0,
  'ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL',
  'SELECT "La columna password ya está correctamente nombrada" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar is_active a active si es necesario
SET @col_exists_old = 0;
SET @col_exists_new = 0;

SELECT COUNT(*) INTO @col_exists_old 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'is_active';

SELECT COUNT(*) INTO @col_exists_new 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'active';

SET @sql = IF(@col_exists_old > 0 AND @col_exists_new = 0,
  'ALTER TABLE users CHANGE COLUMN is_active active TINYINT(1) NOT NULL DEFAULT 1',
  'SELECT "La columna active ya está correctamente nombrada" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar role_id a roleId si es necesario (para Prisma)
SET @col_exists_old = 0;
SET @col_exists_new = 0;

SELECT COUNT(*) INTO @col_exists_old 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role_id';

SELECT COUNT(*) INTO @col_exists_new 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_scripts' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'roleId';

SET @sql = IF(@col_exists_old > 0 AND @col_exists_new = 0,
  'ALTER TABLE users CHANGE COLUMN role_id roleId TINYINT(3) UNSIGNED NOT NULL DEFAULT 2',
  'SELECT "La columna roleId ya está correctamente nombrada" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 8. REACTIVAR FOREIGN KEY CHECKS
-- =====================================================
SET FOREIGN_KEY_CHECKS=1;

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' AS status;

-- Mostrar estructura de la tabla users
DESCRIBE users;

-- Mostrar todas las tablas
SHOW TABLES;

SELECT CONCAT('Total de tablas: ', COUNT(*)) AS resultado 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'gestion_scripts';
