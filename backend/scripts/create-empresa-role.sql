-- Script para añadir rol "empresa" y sus funcionalidades
-- NO borra ningún dato existente
-- Ejecutar este archivo en la base de datos gestion_scripts

USE gestion_scripts;

-- 1. Insertar el nuevo rol "empresa" si no existe
INSERT INTO roles (name, description)
SELECT 'empresa', 'Empresa - Puede gestionar sus propios usuarios y scripts'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE name = 'empresa'
);

-- 2. Añadir columna company_id a la tabla users para agrupar usuarios por empresa
-- Esta columna permite que cada empresa gestione solo a sus usuarios
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'users' 
               AND column_name = 'company_id');

SET @sqlstmt := IF(@exist = 0,
  'ALTER TABLE users ADD COLUMN company_id INT UNSIGNED NULL AFTER role_id',
  'SELECT ''La columna company_id ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Añadir foreign key para company_id (referencia al usuario empresa que los creó)
SET @fk_exist := (SELECT COUNT(*) 
                  FROM information_schema.table_constraints 
                  WHERE table_schema = DATABASE() 
                  AND table_name = 'users' 
                  AND constraint_name = 'fk_users_company');

SET @sqlstmt := IF(@fk_exist = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT ''La foreign key fk_users_company ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Añadir índice en company_id si no existe
SET @idx_exist := (SELECT COUNT(*) 
                   FROM information_schema.statistics 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'users' 
                   AND index_name = 'idx_users_company');

SET @sqlstmt := IF(@idx_exist = 0,
  'ALTER TABLE users ADD INDEX idx_users_company (company_id)',
  'SELECT ''El índice idx_users_company ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Añadir columna company_id a la tabla scripts para que cada empresa gestione sus scripts
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'scripts' 
               AND column_name = 'company_id');

SET @sqlstmt := IF(@exist = 0,
  'ALTER TABLE scripts ADD COLUMN company_id INT UNSIGNED NULL AFTER updated_by',
  'SELECT ''La columna company_id en scripts ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Añadir foreign key para company_id en scripts
SET @fk_exist := (SELECT COUNT(*) 
                  FROM information_schema.table_constraints 
                  WHERE table_schema = DATABASE() 
                  AND table_name = 'scripts' 
                  AND constraint_name = 'fk_scripts_company');

SET @sqlstmt := IF(@fk_exist = 0,
  'ALTER TABLE scripts ADD CONSTRAINT fk_scripts_company FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT ''La foreign key fk_scripts_company ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Añadir índice en company_id de scripts
SET @idx_exist := (SELECT COUNT(*) 
                   FROM information_schema.statistics 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'scripts' 
                   AND index_name = 'idx_scripts_company');

SET @sqlstmt := IF(@idx_exist = 0,
  'ALTER TABLE scripts ADD INDEX idx_scripts_company (company_id)',
  'SELECT ''El índice idx_scripts_company ya existe'' AS message'
);

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Rol empresa creado y tablas actualizadas exitosamente' AS message;
