const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;


class UserService {
  /**
   * Obtiene todos los usuarios (admin ve todos, empresa ve solo sus usuarios)
   * @param {object} filters - Filtros opcionales
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAll(filters = {}, requestUser) {
    const { page = 1, limit = 10, search, roleId, isActive } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Si es empresa, solo ver sus usuarios
    if (requestUser.roleName === 'empresa') {
      where.companyId = requestUser.id;
      logger.info(`[UserService.getAll] Empresa ${requestUser.id} buscando usuarios con companyId=${requestUser.id}`);
    }

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { fullName: { contains: search } }
      ];
    }

    if (roleId !== undefined) {
      where.roleId = parseInt(roleId);
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Eliminar información sensible
    const usersWithoutPasswords = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    logger.info(`[UserService.getAll] Encontrados ${total} usuarios. Filtro: ${JSON.stringify(where)}`);

    return {
      users: usersWithoutPasswords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} id - ID del usuario
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<object>} - Usuario
   */
  async getById(id, requestUser) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si es empresa, verificar que el usuario pertenece a su compañía
    if (requestUser && requestUser.roleName === 'empresa') {
      if (user.companyId !== requestUser.id && user.id !== requestUser.id) {
        throw new Error('No tienes permisos para ver este usuario');
      }
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Crea un nuevo usuario (admin o empresa)
   * @param {object} userData - Datos del usuario
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<object>} - Usuario creado
   */
  async create(userData, requestUser) {
    const { username, email, password, fullName, roleId, isActive } = userData;

    // Validar que el username no exista
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Validar que el email sea proporcionado
    if (!email || !email.trim()) {
      throw new Error('El email es obligatorio');
    }

    // Validar que el email no exista
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    // Si es empresa creando usuario, validar restricciones
    let finalRoleId = roleId || 2;
    let companyId = null;

    if (requestUser && requestUser.roleName === 'empresa') {
      // Empresa no puede crear admin ni empresa
      const role = await prisma.role.findUnique({ where: { id: finalRoleId } });
      if (role && (role.name === 'admin' || role.name === 'empresa')) {
        throw new Error('No tienes permisos para crear usuarios con este rol');
      }
      // El usuario creado pertenece a la empresa
      companyId = requestUser.id;
      logger.info(`[UserService.create] Empresa ${requestUser.id} (${requestUser.username}) creando usuario con companyId=${companyId}`);
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario con su lista de Favoritos
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          roleId: finalRoleId,
          isActive: isActive !== undefined ? isActive : true,
          companyId
        },
        include: {
          role: true
        }
      });

      // Crear lista de Favoritos por defecto
      await tx.scriptList.create({
        data: {
          name: 'Favoritos',
          description: 'Scripts marcados como favoritos',
          userId: newUser.id,
          isDefault: true,
          color: '#FFD700',
          icon: 'heart'
        }
      });

      return newUser;
    });

    logger.info(`Usuario creado: ${username} (ID: ${user.id})`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualiza un usuario (admin o empresa)
   * @param {number} id - ID del usuario
   * @param {object} userData - Datos a actualizar
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<object>} - Usuario actualizado
   */
  async update(id, userData, requestUser) {
    const { username, email, password, fullName, roleId, isActive } = userData;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { role: true }
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Si es empresa, verificar que el usuario pertenece a su compañía
    if (requestUser && requestUser.roleName === 'empresa') {
      if (existingUser.companyId !== requestUser.id) {
        throw new Error('No tienes permisos para modificar este usuario');
      }
      // Empresa no puede cambiar rol a admin o empresa
      if (roleId) {
        const newRole = await prisma.role.findUnique({ where: { id: roleId } });
        if (newRole && (newRole.name === 'admin' || newRole.name === 'empresa')) {
          throw new Error('No tienes permisos para asignar este rol');
        }
      }
    }

    const updateData = {};

    // Validar username único si se está cambiando
    if (username && username !== existingUser.username) {
      const userWithUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (userWithUsername) {
        throw new Error('El nombre de usuario ya existe');
      }

      updateData.username = username;
    }

    // Validar email único si se está cambiando
    if (email !== undefined && email !== existingUser.email) {
      if (email) {
        const userWithEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (userWithEmail && userWithEmail.id !== parseInt(id)) {
          throw new Error('El email ya está registrado');
        }
      }
      updateData.email = email;
    }

    // Hash de la nueva contraseña si se proporciona
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (fullName !== undefined) updateData.fullName = fullName;
    if (roleId !== undefined) updateData.roleId = parseInt(roleId);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        role: true
      }
    });

    logger.info(`Usuario actualizado: ${user.username} (ID: ${user.id})`);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Elimina un usuario (admin o empresa)
   * @param {number} id - ID del usuario
   * @param {object} requestUser - Usuario que hace la petición
   */
  async delete(id, requestUser) {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si es empresa, verificar que el usuario pertenece a su compañía
    if (requestUser && requestUser.roleName === 'empresa') {
      if (user.companyId !== requestUser.id) {
        throw new Error('No tienes permisos para eliminar este usuario');
      }
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Usuario eliminado: ${user.username} (ID: ${user.id})`);
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<object>} - Estadísticas
   */
  async getStats() {
    const [total, active, inactive, admins, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { roleId: 1 } }),
      prisma.user.count({ where: { roleId: 2 } })
    ]);

    return {
      total,
      active,
      inactive,
      byRole: {
        admin: admins,
        user: users
      }
    };
  }
}

module.exports = new UserService();
