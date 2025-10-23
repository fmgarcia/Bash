const { PrismaClient } = require('@prisma/client');
const PowerShellHelper = require('../utils/powershell-helper');
const { validateAndSanitizeParameters, replacePlaceholders } = require('../utils/sanitize');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const psHelper = new PowerShellHelper(process.env.TMP_SCRIPT_DIR);

class ExecutionService {
  /**
   * Ejecuta un script
   * @param {number} scriptId - ID del script a ejecutar
   * @param {object} parameters - Parámetros del script
   * @param {number} userId - ID del usuario que ejecuta
   * @returns {Promise<object>} - Información de la ejecución
   */
  async execute(scriptId, parameters = {}, userId) {
    // Obtener script
    const script = await prisma.script.findUnique({
      where: { id: parseInt(scriptId) }
    });

    if (!script) {
      throw new Error('Script no encontrado');
    }

    if (!script.isEnabled) {
      throw new Error('El script está deshabilitado');
    }

    // Validar y sanitizar parámetros
    let sanitizedParams = {};
    if (script.parametersSchema) {
      try {
        sanitizedParams = validateAndSanitizeParameters(
          parameters,
          script.parametersSchema
        );
      } catch (error) {
        throw new Error(`Error validando parámetros: ${error.message}`);
      }
    }

    // Reemplazar placeholders en el body del script
    let scriptContent = script.body;
    if (Object.keys(sanitizedParams).length > 0) {
      try {
        scriptContent = replacePlaceholders(script.body, sanitizedParams);
      } catch (error) {
        throw new Error(`Error reemplazando parámetros: ${error.message}`);
      }
    }

    // Crear registro de ejecución inicial
    const executionLog = await prisma.executionLog.create({
      data: {
        scriptId: script.id,
        executedBy: userId,
        startedAt: new Date(),
        executionContext: JSON.stringify({
          parameters: sanitizedParams,
          scriptVersion: script.version,
          interpreter: script.interpreter
        })
      }
    });

    logger.info(`Iniciando ejecución de script ${script.name} (ID: ${script.id}) por usuario ${userId}`);

    try {
      // Ejecutar script según el modo configurado
      const executionMode = process.env.EXECUTION_MODE || 'headless';
      const result = await psHelper.execute(
        scriptContent,
        script.id,
        executionMode,
        true // deleteAfter
      );

      // Actualizar registro de ejecución con resultados
      const updatedLog = await prisma.executionLog.update({
        where: { id: executionLog.id },
        data: {
          finishedAt: new Date(),
          durationSeconds: result.duration,
          exitCode: result.exitCode,
          success: result.success,
          stdout: result.stdout || null,
          stderr: result.stderr || null,
          hostName: result.hostName,
          hostIp: result.hostIp
        }
      });

      // Actualizar contadores del script
      await prisma.script.update({
        where: { id: script.id },
        data: {
          lastExecutedAt: new Date(),
          executionCount: script.executionCount + 1
        }
      });

      // Registrar en auditoría
      await this.createAuditTrail('execution', executionLog.id, 'EXECUTE', userId, {
        scriptId: script.id,
        scriptName: script.name,
        success: result.success,
        exitCode: result.exitCode
      });

      logger.info(
        `Ejecución completada: ${script.name} (ID: ${script.id}) - ` +
        `Exit Code: ${result.exitCode}, Success: ${result.success}, Duration: ${result.duration}s`
      );

      return {
        executionLogId: executionLog.id,
        ...result,
        script: {
          id: script.id,
          name: script.name,
          version: script.version
        }
      };
    } catch (error) {
      // Actualizar registro de ejecución con error
      await prisma.executionLog.update({
        where: { id: executionLog.id },
        data: {
          finishedAt: new Date(),
          exitCode: -1,
          success: false,
          stderr: `Error durante la ejecución: ${error.message}`
        }
      });

      logger.error(`Error ejecutando script ${script.name} (ID: ${script.id}): ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el historial de ejecuciones con filtros
   * @param {object} filters - Filtros de búsqueda
   * @param {object} user - Usuario que hace la petición
   * @returns {Promise<object>} - Ejecuciones y paginación
   */
  async getExecutions(filters = {}, user) {
    const { page = 1, limit = 20, scriptId, userId, success, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    // Los usuarios normales solo ven sus propias ejecuciones
    if (user.roleName !== 'admin') {
      where.executedBy = user.id;
    } else if (userId !== undefined) {
      where.executedBy = parseInt(userId);
    }

    if (scriptId !== undefined) {
      where.scriptId = parseInt(scriptId);
    }

    if (success !== undefined) {
      where.success = success === 'true' || success === true;
    }

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    const [executions, total] = await Promise.all([
      prisma.executionLog.findMany({
        where,
        include: {
          script: {
            select: {
              id: true,
              name: true,
              description: true,
              interpreter: true
            }
          },
          executorUser: {
            select: {
              id: true,
              username: true,
              fullName: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { startedAt: 'desc' }
      }),
      prisma.executionLog.count({ where })
    ]);

    return {
      executions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene una ejecución específica
   * @param {number} id - ID de la ejecución
   * @param {object} user - Usuario que hace la petición
   * @returns {Promise<object>} - Ejecución
   */
  async getExecutionById(id, user) {
    const where = { id: BigInt(id) };

    // Los usuarios normales solo ven sus propias ejecuciones
    if (user.roleName !== 'admin') {
      where.executedBy = user.id;
    }

    const execution = await prisma.executionLog.findFirst({
      where,
      include: {
        script: {
          select: {
            id: true,
            name: true,
            description: true,
            interpreter: true,
            version: true
          }
        },
        executorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    if (!execution) {
      throw new Error('Ejecución no encontrada o no tienes permisos para verla');
    }

    return execution;
  }

  /**
   * Obtiene estadísticas de ejecuciones
   * @param {object} filters - Filtros opcionales
   * @returns {Promise<object>} - Estadísticas
   */
  async getStats(filters = {}) {
    const { scriptId, userId, days = 30 } = filters;
    
    const where = {};
    
    if (scriptId) {
      where.scriptId = parseInt(scriptId);
    }
    
    if (userId) {
      where.executedBy = parseInt(userId);
    }

    // Últimos N días
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));
    where.startedAt = { gte: dateLimit };

    const [total, successful, failed, avgDuration] = await Promise.all([
      prisma.executionLog.count({ where }),
      prisma.executionLog.count({ where: { ...where, success: true } }),
      prisma.executionLog.count({ where: { ...where, success: false } }),
      prisma.executionLog.aggregate({
        where: { ...where, durationSeconds: { not: null } },
        _avg: {
          durationSeconds: true
        }
      })
    ]);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
      avgDuration: avgDuration._avg.durationSeconds 
        ? parseFloat(avgDuration._avg.durationSeconds).toFixed(3)
        : 0,
      period: `${days} días`
    };
  }

  /**
   * Crea un registro de auditoría
   * @param {string} entity - Entidad
   * @param {number} entityId - ID de la entidad
   * @param {string} action - Acción realizada
   * @param {number} userId - ID del usuario
   * @param {object} details - Detalles adicionales
   */
  async createAuditTrail(entity, entityId, action, userId, details = {}) {
    await prisma.auditTrail.create({
      data: {
        entity,
        entityId: BigInt(entityId),
        action,
        performedBy: userId,
        details: JSON.stringify(details)
      }
    });
  }
}

module.exports = new ExecutionService();
