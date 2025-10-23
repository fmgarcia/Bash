const { body, validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Validaciones para registro
   */
  static validateRegister = [
    body('username')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El username debe tener entre 3 y 100 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('El username solo puede contener letras, números, guiones y guiones bajos'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('El nombre completo no puede exceder 255 caracteres')
  ];

  /**
   * Validaciones para login
   */
  static validateLogin = [
    body('username').trim().notEmpty().withMessage('El username es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ];

  /**
   * Registra un nuevo usuario
   */
  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      // Solo admin puede registrar usuarios con rol admin
      if (req.body.roleId === 1 && (!req.user || req.user.roleName !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear usuarios administradores'
        });
      }

      const user = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login de usuario
   */
  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;
      const result = await authService.login(username, password);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      if (error.message.includes('Credenciales') || error.message.includes('inactivo')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Refresca el access token
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido'
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout de usuario
   */
  static async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);

      res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  static async me(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres'
        });
      }

      await authService.changePassword(req.user.id, oldPassword, newPassword);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente. Por favor inicia sesión nuevamente.'
      });
    } catch (error) {
      if (error.message.includes('incorrecta')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = AuthController;
