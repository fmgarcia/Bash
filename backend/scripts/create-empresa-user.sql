-- Script para crear usuario de prueba con rol empresa
-- Este script crea un usuario empresa de prueba para validar la funcionalidad
-- Password: empresa123

USE gestion_scripts;

-- Obtener el roleId de empresa
SET @empresa_role_id = (SELECT id FROM roles WHERE name = 'empresa' LIMIT 1);

-- Insertar usuario empresa si no existe
INSERT INTO users (username, email, password_hash, full_name, role_id, is_active, company_id, created_at, updated_at)
SELECT 
    'empresa_test',
    'empresa@test.com',
    '$2b$10$Y.5VsUugklGuchTnymsB3ekrtqKjHevomIzBvn9MZ143SdipnpeJS', -- Password: empresa123
    'Empresa Test',
    @empresa_role_id,
    1,
    NULL, -- Las empresas no tienen company_id, ellos SON la compañía
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'empresa_test'
);

-- Obtener el ID del usuario empresa recién creado
SET @empresa_user_id = (SELECT id FROM users WHERE username = 'empresa_test' LIMIT 1);

-- Crear lista de favoritos por defecto para el usuario empresa
INSERT INTO script_lists (name, description, user_id, is_default, color, icon, created_at, updated_at)
SELECT
    'Favoritos',
    'Scripts marcados como favoritos',
    @empresa_user_id,
    1,
    '#FFD700',
    'heart',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM script_lists WHERE user_id = @empresa_user_id AND is_default = 1
);

SELECT 'Usuario empresa creado exitosamente' AS mensaje, 
       @empresa_user_id AS user_id,
       'empresa_test' AS username,
       'empresa@test.com' AS email;
