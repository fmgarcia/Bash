const scriptService = require('../services/script.service');

class ScriptsController {
  /**
   * Obtiene todos los scripts
   */
  static async getAll(req, res, next) {
    try {
      const result = await scriptService.getAll(req.query, req.user);

      res.json({
        success: true,
        data: result.scripts,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un script por ID
   */
  static async getById(req, res, next) {
    try {
      const script = await scriptService.getById(req.params.id, req.user);

      res.json({
        success: true,
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo script
   */
  static async create(req, res, next) {
    try {
      const script = await scriptService.create(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Script creado exitosamente',
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza un script
   */
  static async update(req, res, next) {
    try {
      const script = await scriptService.update(req.params.id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Script actualizado exitosamente',
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un script
   */
  static async delete(req, res, next) {
    try {
      await scriptService.delete(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Script eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las versiones de un script
   */
  static async getVersions(req, res, next) {
    try {
      const versions = await scriptService.getVersions(req.params.id);

      res.json({
        success: true,
        data: versions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de scripts
   */
  static async getStats(req, res, next) {
    try {
      const stats = await scriptService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ScriptsController;
