const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class ScriptService {
  /**
   * Obtiene todos los scripts con filtros
   * @param {object} filters - Filtros y paginación
   * @param {object} user - Usuario que hace la petición
   * @returns {Promise<object>} - Scripts y paginación
   */
  async getAll(filters = {}, user) {
    const { page = 1, limit = 20, search, tags, enabled, interpreter } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    // Si es empresa, solo ve scripts de su compañía
    if (user.role && user.role.name === 'empresa') {
      where.companyId = user.id;
    }

    // Los usuarios normales solo ven scripts habilitados
    if (user.roleName !== 'admin' && (!user.role || user.role.name !== 'empresa')) {
      where.isEnabled = true;
    } else if (enabled !== undefined) {
      where.isEnabled = enabled === 'true' || enabled === true;
    }

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    // Filtro por tags
    if (tags) {
      where.tags = { contains: tags };
    }

    // Filtro por interpreter
    if (interpreter) {
      where.interpreter = interpreter;
    }

    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where,
        include: {
          creatorUser: {
            select: {
              id: true,
              username: true,
              fullName: true
            }
          },
          updaterUser: {
            select: {
              id: true,
              username: true,
              fullName: true
            }
          },
          scriptListItems: {
            where: {
              list: {
                userId: user.id
              }
            },
            select: {
              listId: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.script.count({ where })
    ]);

    return {
      scripts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene un script por ID
   * @param {number} id - ID del script
   * @param {object} user - Usuario que hace la petición
   * @returns {Promise<object>} - Script
   */
  async getById(id, user) {
    const where = { id: parseInt(id) };

    // Si es empresa, solo ve scripts de su compañía
    if (user.role && user.role.name === 'empresa') {
      where.companyId = user.id;
    }

    // Los usuarios normales solo ven scripts habilitados
    if (user.roleName !== 'admin' && (!user.role || user.role.name !== 'empresa')) {
      where.isEnabled = true;
    }

    const script = await prisma.script.findFirst({
      where,
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        updaterUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        scriptVersions: {
          orderBy: { version: 'desc' },
          take: 5,
          include: {
            creatorUser: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!script) {
      throw new Error('Script no encontrado o no tienes permisos para verlo');
    }

    return script;
  }

  /**
   * Crea un nuevo script
   * @param {object} scriptData - Datos del script
   * @param {number} userId - ID del usuario creador
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<object>} - Script creado
   */
  async create(scriptData, userId, requestUser) {
    const {
      name,
      description,
      body,
      interpreter = 'powershell',
      entryPoint,
      parametersSchema,
      tags,
      isEnabled = true
    } = scriptData;

    // Si es empresa, establecer companyId
    let companyId = null;
    if (requestUser && requestUser.roleName === 'empresa') {
      companyId = requestUser.id;
    }

    // Validar parametersSchema si se proporciona
    let parsedSchema = null;
    if (parametersSchema) {
      try {
        parsedSchema = typeof parametersSchema === 'string' 
          ? JSON.parse(parametersSchema) 
          : parametersSchema;
      } catch (error) {
        throw new Error('El schema de parámetros debe ser un JSON válido');
      }
    }

    // Crear script
    const script = await prisma.script.create({
      data: {
        name,
        description,
        body,
        interpreter,
        entryPoint,
        parametersSchema: parsedSchema ? JSON.stringify(parsedSchema) : null,
        tags,
        isEnabled,
        createdBy: userId,
        updatedBy: userId,
        version: 1,
        companyId
      },
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    // Crear primera versión
    await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        version: 1,
        body,
        notes: 'Versión inicial',
        createdBy: userId
      }
    });

    // Registrar en auditoría
    await this.createAuditTrail('script', script.id, 'CREATE', userId, {
      name: script.name,
      version: 1
    });

    logger.info(`Script creado: ${name} (ID: ${script.id}) por usuario ${userId}`);

    return script;
  }

  /**
   * Actualiza un script (admin o empresa)
   * @param {number} id - ID del script
   * @param {object} scriptData - Datos a actualizar
   * @param {number} userId - ID del usuario que actualiza
   * @param {object} requestUser - Usuario que hace la petición
   * @returns {Promise<object>} - Script actualizado
   */
  async update(id, scriptData, userId, requestUser) {
    const {
      name,
      description,
      body,
      interpreter,
      entryPoint,
      parametersSchema,
      tags,
      isEnabled
    } = scriptData;

    // Verificar que el script existe
    const existingScript = await prisma.script.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingScript) {
      throw new Error('Script no encontrado');
    }

    // Si es empresa, verificar que el script pertenece a su compañía
    if (requestUser && requestUser.roleName === 'empresa') {
      if (existingScript.companyId !== requestUser.id) {
        throw new Error('No tienes permisos para modificar este script');
      }
    }

    const updateData = {
      updatedBy: userId
    };

    // Validar parametersSchema si se proporciona
    let parsedSchema = null;
    if (parametersSchema !== undefined) {
      if (parametersSchema) {
        try {
          parsedSchema = typeof parametersSchema === 'string' 
            ? JSON.parse(parametersSchema) 
            : parametersSchema;
          updateData.parametersSchema = JSON.stringify(parsedSchema);
        } catch (error) {
          throw new Error('El schema de parámetros debe ser un JSON válido');
        }
      } else {
        updateData.parametersSchema = null;
      }
    }

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (interpreter !== undefined) updateData.interpreter = interpreter;
    if (entryPoint !== undefined) updateData.entryPoint = entryPoint;
    if (tags !== undefined) updateData.tags = tags;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

    // Si cambia el body, incrementar versión y crear nueva entrada en scriptVersions
    let newVersion = null;
    if (body !== undefined && body !== existingScript.body) {
      const newVersionNumber = existingScript.version + 1;
      updateData.body = body;
      updateData.version = newVersionNumber;

      newVersion = await prisma.scriptVersion.create({
        data: {
          scriptId: parseInt(id),
          version: newVersionNumber,
          body,
          notes: 'Actualización del script',
          createdBy: userId
        }
      });
    }

    // Actualizar script
    const script = await prisma.script.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        updaterUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    // Registrar en auditoría
    await this.createAuditTrail('script', script.id, 'UPDATE', userId, {
      name: script.name,
      version: script.version,
      changes: Object.keys(updateData)
    });

    logger.info(`Script actualizado: ${script.name} (ID: ${script.id}) por usuario ${userId}`);

    return script;
  }

  /**
   * Elimina un script (admin o empresa)
   * @param {number} id - ID del script
   * @param {number} userId - ID del usuario que elimina
   * @param {object} requestUser - Usuario que hace la petición
   */
  async delete(id, userId, requestUser) {
    // Verificar que el script existe
    const script = await prisma.script.findUnique({
      where: { id: parseInt(id) }
    });

    if (!script) {
      throw new Error('Script no encontrado');
    }

    // Si es empresa, verificar que el script pertenece a su compañía
    if (requestUser && requestUser.roleName === 'empresa') {
      if (script.companyId !== requestUser.id) {
        throw new Error('No tienes permisos para eliminar este script');
      }
    }

    // Registrar en auditoría antes de eliminar
    await this.createAuditTrail('script', script.id, 'DELETE', userId, {
      name: script.name,
      version: script.version
    });

    // Eliminar script (cascade eliminará versiones y execution logs)
    await prisma.script.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Script eliminado: ${script.name} (ID: ${script.id}) por usuario ${userId}`);
  }

  /**
   * Obtiene las versiones de un script
   * @param {number} scriptId - ID del script
   * @returns {Promise<Array>} - Versiones del script
   */
  async getVersions(scriptId) {
    const versions = await prisma.scriptVersion.findMany({
      where: { scriptId: parseInt(scriptId) },
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: { version: 'desc' }
    });

    return versions;
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

  /**
   * Obtiene estadísticas de scripts
   * @returns {Promise<object>} - Estadísticas
   */
  async getStats() {
    const [total, enabled, disabled, byInterpreter] = await Promise.all([
      prisma.script.count(),
      prisma.script.count({ where: { isEnabled: true } }),
      prisma.script.count({ where: { isEnabled: false } }),
      prisma.script.groupBy({
        by: ['interpreter'],
        _count: true
      })
    ]);

    return {
      total,
      enabled,
      disabled,
      byInterpreter: byInterpreter.reduce((acc, item) => {
        acc[item.interpreter] = item._count;
        return acc;
      }, {})
    };
  }
}

module.exports = new ScriptService();
