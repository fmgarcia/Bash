const executionService = require('../services/execution.service');

class ExecutionController {
  /**
   * Ejecuta un script
   */
  static async execute(req, res, next) {
    try {
      const { id } = req.params;
      const { parameters } = req.body;

      const result = await executionService.execute(
        id,
        parameters || {},
        req.user.id
      );

      res.json({
        success: true,
        message: 'Script ejecutado',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el historial de ejecuciones
   */
  static async getExecutions(req, res, next) {
    try {
      const result = await executionService.getExecutions(req.query, req.user);

      res.json({
        success: true,
        data: result.executions,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una ejecución específica
   */
  static async getExecutionById(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user);

      res.json({
        success: true,
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de ejecuciones
   */
  static async getStats(req, res, next) {
    try {
      const stats = await executionService.getStats(req.query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExecutionController;
