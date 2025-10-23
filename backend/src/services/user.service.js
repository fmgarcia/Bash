const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

class UserService {
  /**
   * Obtiene todos los usuarios (solo admin)
   * @param {object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAll(filters = {}) {
    const { page = 1, limit = 20, search, roleId, isActive } = filters;
    const skip = (page - 1) * limit;

    const where = {};

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
      const { passwordHash, refreshToken, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

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
   * @returns {Promise<object>} - Usuario
   */
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { passwordHash, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Crea un nuevo usuario (solo admin)
   * @param {object} userData - Datos del usuario
   * @returns {Promise<object>} - Usuario creado
   */
  async create(userData) {
    const { username, email, password, fullName, roleId, isActive } = userData;

    // Validar que el username no exista
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Validar email si se proporciona
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        roleId: roleId || 2,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        role: true
      }
    });

    logger.info(`Usuario creado: ${username} (ID: ${user.id})`);

    const { passwordHash: _, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualiza un usuario (solo admin)
   * @param {number} id - ID del usuario
   * @param {object} userData - Datos a actualizar
   * @returns {Promise<object>} - Usuario actualizado
   */
  async update(id, userData) {
    const { username, email, password, fullName, roleId, isActive } = userData;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
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
      // Invalidar refresh token al cambiar contraseña
      updateData.refreshToken = null;
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

    const { passwordHash, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Elimina un usuario (solo admin)
   * @param {number} id - ID del usuario
   */
  async delete(id) {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
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
