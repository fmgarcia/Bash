-- Script para corregir usuarios creados por empresas que no tienen companyId asignado
-- Este script encuentra usuarios que probablemente fueron creados por una empresa
-- pero que no tienen el companyId establecido debido a un bug previo

-- Primero, verificar qué usuarios tienen este problema
-- (usuarios con role 'user' que no tienen companyId)
SELECT 
    u.id,
    u.username,
    u.email,
    u.fullName,
    u.companyId,
    u.createdAt,
    r.name as roleName
FROM users u
INNER JOIN roles r ON u.roleId = r.id
WHERE u.companyId IS NULL 
  AND r.name = 'user'
ORDER BY u.createdAt DESC;

-- Si necesitas asignar manualmente un usuario a una empresa específica:
-- Reemplaza {USER_ID} con el ID del usuario que necesita ser corregido
-- Reemplaza {COMPANY_ID} con el ID del usuario empresa al que pertenece

-- UPDATE users 
-- SET companyId = {COMPANY_ID}
-- WHERE id = {USER_ID};

-- Ejemplo: Si el usuario con ID 10 pertenece a la empresa con ID 5:
-- UPDATE users SET companyId = 5 WHERE id = 10;

-- Para verificar los usuarios de una empresa específica después de la corrección:
-- SELECT u.id, u.username, u.email, u.fullName, u.companyId
-- FROM users u
-- WHERE u.companyId = {COMPANY_ID};
