-- Script para crear las nuevas tablas de listas de scripts
-- NO borra ninguna tabla ni dato existente
-- Ejecutar este archivo en la base de datos gestion_scripts

USE gestion_scripts;

-- Tabla para las listas de scripts de cada usuario
CREATE TABLE IF NOT EXISTS script_lists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INT UNSIGNED NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  color VARCHAR(20),
  icon VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_script_lists_user (user_id),
  UNIQUE KEY uq_script_lists_user_name (user_id, name),
  
  CONSTRAINT fk_script_lists_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para los items de cada lista (relación muchos a muchos entre scripts y listas)
CREATE TABLE IF NOT EXISTS script_list_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  list_id INT UNSIGNED NOT NULL,
  script_id INT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  INDEX idx_script_list_items_list (list_id),
  INDEX idx_script_list_items_script (script_id),
  UNIQUE KEY uq_script_list_items_list_script (list_id, script_id),
  
  CONSTRAINT fk_script_list_items_list 
    FOREIGN KEY (list_id) 
    REFERENCES script_lists(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_script_list_items_script 
    FOREIGN KEY (script_id) 
    REFERENCES scripts(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir índice en la columna interpreter de scripts si no existe
-- (para mejorar el rendimiento del filtro por intérprete)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'scripts' 
               AND index_name = 'idx_scripts_interpreter');

SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE scripts ADD INDEX idx_scripts_interpreter (interpreter)',
  'SELECT ''El índice idx_scripts_interpreter ya existe'' AS message');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear lista de Favoritos por defecto para cada usuario existente
INSERT INTO script_lists (name, description, user_id, is_default, color, icon)
SELECT 
  'Favoritos',
  'Scripts marcados como favoritos',
  id,
  1,
  '#FFD700',
  'heart'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM script_lists 
  WHERE script_lists.user_id = users.id 
  AND script_lists.name = 'Favoritos'
);

SELECT 'Tablas creadas exitosamente y lista de Favoritos añadida a usuarios existentes' AS message;
