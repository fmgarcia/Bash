const userService = require('../services/user.service');

class UsersController {
  /**
   * Obtiene todos los usuarios
   */
  static async getAll(req, res, next) {
    try {
      const result = await userService.getAll(req.query, req.user);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id, req.user);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async create(req, res, next) {
    try {
      const user = await userService.create(req.body, req.user);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza un usuario
   */
  static async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body, req.user);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un usuario
   */
  static async delete(req, res, next) {
    try {
      await userService.delete(req.params.id, req.user);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  static async getStats(req, res, next) {
    try {
      const stats = await userService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
