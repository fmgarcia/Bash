const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 días

class AuthService {
  /**
   * Genera un token JWT de acceso
   * @param {object} user - Usuario
   * @returns {string} - Token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        roleId: user.roleId,
        roleName: user.role.name
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Genera un token JWT de refresco
   * @param {object} user - Usuario
   * @returns {string} - Token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  /**
   * Registra un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise<object>} - Usuario creado
   */
  async register(userData) {
    const { username, email, password, fullName, roleId } = userData;

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
        roleId: roleId || 2, // Por defecto 'user'
        isActive: true
      },
      include: {
        role: true
      }
    });

    logger.info(`Usuario registrado: ${username} (ID: ${user.id})`);

    return user;
  }

  /**
   * Login de usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<object>} - Tokens y usuario
   */
  async login(username, password) {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: true
      }
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new Error('Usuario inactivo. Contacta al administrador');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Actualizar última fecha de login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date()
      }
    });

    logger.info(`Login exitoso: ${username} (ID: ${user.id})`);

    // No devolver información sensible
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Refresca el access token usando el refresh token
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<object>} - Nuevo access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.isActive) {
        throw new Error('Usuario inactivo');
      }

      // Generar nuevo access token
      const accessToken = this.generateAccessToken(user);

      logger.info(`Access token refrescado para usuario: ${user.username}`);

      return {
        accessToken
      };
    } catch (error) {
      logger.error(`Error refrescando token: ${error.message}`);
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Logout de usuario
   * @param {number} userId - ID del usuario
   */
  async logout(userId) {
    // En esta versión, el refresh token se maneja solo en el cliente
    // No es necesario actualizar la base de datos
    logger.info(`Logout exitoso para usuario ID: ${userId}`);
  }

  /**
   * Cambia la contraseña del usuario
   * @param {number} userId - ID del usuario
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar contraseña e invalidar refresh token
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        refreshToken: null
      }
    });

    logger.info(`Contraseña cambiada para usuario ID: ${userId}`);
  }
}

module.exports = new AuthService();
