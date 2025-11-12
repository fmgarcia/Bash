const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class ScriptListService {
  /**
   * Obtiene todas las listas de un usuario
   * Incluye listas propias y listas de la empresa si el usuario pertenece a una
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de listas del usuario
   */
  async getUserLists(userId) {
    // Obtener información del usuario para ver si pertenece a una empresa
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { companyId: true, roleId: true }
    });

    // Construir condiciones de búsqueda
    const whereConditions = [];
    
    // Siempre incluir las listas propias del usuario
    whereConditions.push({ userId: parseInt(userId) });
    
    // Si el usuario pertenece a una empresa (companyId no es null), incluir listas de la empresa
    if (user && user.companyId) {
      whereConditions.push({ userId: user.companyId });
    }

    const lists = await prisma.scriptList.findMany({
      where: {
        OR: whereConditions
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return lists;
  }

  /**
   * Obtiene una lista específica con sus scripts
   * @param {number} listId - ID de la lista
   * @param {number} userId - ID del usuario (para verificar permisos)
   * @returns {Promise<object>} - Lista con sus scripts
   */
  async getListById(listId, userId) {
    // Obtener información del usuario para ver si pertenece a una empresa
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { companyId: true }
    });

    // Construir condiciones de búsqueda
    const whereConditions = [];
    
    // Puede acceder a sus propias listas
    whereConditions.push({ 
      id: parseInt(listId),
      userId: parseInt(userId)
    });
    
    // Si pertenece a una empresa, puede acceder a las listas de la empresa
    if (user && user.companyId) {
      whereConditions.push({ 
        id: parseInt(listId),
        userId: user.companyId
      });
    }

    const list = await prisma.scriptList.findFirst({
      where: {
        OR: whereConditions
      },
      include: {
        items: {
          include: {
            script: {
              select: {
                id: true,
                name: true,
                description: true,
                interpreter: true,
                tags: true,
                isEnabled: true,
                createdAt: true,
                updatedAt: true,
                executionCount: true,
                lastExecutedAt: true
              }
            }
          },
          orderBy: {
            addedAt: 'desc'
          }
        }
      }
    });

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos para acceder');
    }

    return list;
  }

  /**
   * Crea una nueva lista
   * @param {number} userId - ID del usuario
   * @param {object} listData - Datos de la lista
   * @returns {Promise<object>} - Lista creada
   */
  async createList(userId, listData) {
    const { name, description, color, icon } = listData;

    // Verificar que no exista una lista con el mismo nombre para este usuario
    const existingList = await prisma.scriptList.findFirst({
      where: {
        userId: parseInt(userId),
        name: name
      }
    });

    if (existingList) {
      throw new Error('Ya existe una lista con ese nombre');
    }

    const list = await prisma.scriptList.create({
      data: {
        name,
        description: description || null,
        userId: parseInt(userId),
        color: color || null,
        icon: icon || null,
        isDefault: false
      }
    });

    logger.info(`Lista creada: ${name} (ID: ${list.id}) por usuario ${userId}`);
    return list;
  }

  /**
   * Actualiza una lista
   * @param {number} listId - ID de la lista
   * @param {number} userId - ID del usuario
   * @param {object} listData - Datos a actualizar
   * @returns {Promise<object>} - Lista actualizada
   */
  async updateList(listId, userId, listData) {
    // Verificar que la lista pertenece al usuario
    const list = await prisma.scriptList.findFirst({
      where: {
        id: parseInt(listId),
        userId: parseInt(userId)
      }
    });

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos para modificarla');
    }

    // No permitir cambiar el nombre si es la lista por defecto
    if (list.isDefault && listData.name && listData.name !== list.name) {
      throw new Error('No puedes cambiar el nombre de la lista por defecto');
    }

    const { name, description, color, icon } = listData;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const updatedList = await prisma.scriptList.update({
      where: { id: parseInt(listId) },
      data: updateData
    });

    logger.info(`Lista actualizada: ${updatedList.name} (ID: ${listId})`);
    return updatedList;
  }

  /**
   * Elimina una lista (no se puede eliminar la lista por defecto)
   * @param {number} listId - ID de la lista
   * @param {number} userId - ID del usuario
   */
  async deleteList(listId, userId) {
    const list = await prisma.scriptList.findFirst({
      where: {
        id: parseInt(listId),
        userId: parseInt(userId)
      }
    });

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos para eliminarla');
    }

    if (list.isDefault) {
      throw new Error('No puedes eliminar la lista por defecto');
    }

    await prisma.scriptList.delete({
      where: { id: parseInt(listId) }
    });

    logger.info(`Lista eliminada: ${list.name} (ID: ${listId})`);
  }

  /**
   * Añade un script a una lista
   * @param {number} listId - ID de la lista
   * @param {number} scriptId - ID del script
   * @param {number} userId - ID del usuario
   * @param {string} notes - Notas opcionales
   * @returns {Promise<object>} - Item creado
   */
  async addScriptToList(listId, scriptId, userId, notes = null) {
    // Verificar que la lista pertenece al usuario
    const list = await prisma.scriptList.findFirst({
      where: {
        id: parseInt(listId),
        userId: parseInt(userId)
      }
    });

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Verificar que el script existe
    const script = await prisma.script.findUnique({
      where: { id: parseInt(scriptId) }
    });

    if (!script) {
      throw new Error('Script no encontrado');
    }

    // Verificar si ya existe el script en la lista
    const existingItem = await prisma.scriptListItem.findFirst({
      where: {
        listId: parseInt(listId),
        scriptId: parseInt(scriptId)
      }
    });

    if (existingItem) {
      throw new Error('El script ya está en esta lista');
    }

    // Crear el item
    const item = await prisma.scriptListItem.create({
      data: {
        listId: parseInt(listId),
        scriptId: parseInt(scriptId),
        notes: notes || null
      },
      include: {
        script: true
      }
    });

    logger.info(`Script ${scriptId} añadido a lista ${listId}`);
    return item;
  }

  /**
   * Elimina un script de una lista
   * @param {number} listId - ID de la lista
   * @param {number} scriptId - ID del script
   * @param {number} userId - ID del usuario
   */
  async removeScriptFromList(listId, scriptId, userId) {
    // Verificar que la lista pertenece al usuario
    const list = await prisma.scriptList.findFirst({
      where: {
        id: parseInt(listId),
        userId: parseInt(userId)
      }
    });

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Buscar y eliminar el item
    const item = await prisma.scriptListItem.findFirst({
      where: {
        listId: parseInt(listId),
        scriptId: parseInt(scriptId)
      }
    });

    if (!item) {
      throw new Error('El script no está en esta lista');
    }

    await prisma.scriptListItem.delete({
      where: { id: item.id }
    });

    logger.info(`Script ${scriptId} eliminado de lista ${listId}`);
  }

  /**
   * Obtiene las listas que contienen un script específico
   * @param {number} scriptId - ID del script
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Listas que contienen el script
   */
  async getScriptLists(scriptId, userId) {
    const lists = await prisma.scriptList.findMany({
      where: {
        userId: parseInt(userId),
        items: {
          some: {
            scriptId: parseInt(scriptId)
          }
        }
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        isDefault: true
      }
    });

    return lists;
  }

  /**
   * Añade/elimina un script de múltiples listas
   * @param {number} scriptId - ID del script
   * @param {number} userId - ID del usuario
   * @param {Array<number>} listIds - IDs de las listas donde debe estar el script
   */
  async updateScriptLists(scriptId, userId, listIds) {
    // Verificar que el script existe
    const script = await prisma.script.findUnique({
      where: { id: parseInt(scriptId) }
    });

    if (!script) {
      throw new Error('Script no encontrado');
    }

    // Obtener todas las listas del usuario
    const userLists = await prisma.scriptList.findMany({
      where: { userId: parseInt(userId) },
      select: { id: true }
    });

    const userListIds = userLists.map(l => l.id);

    // Validar que todas las listas pertenecen al usuario
    const invalidListIds = listIds.filter(id => !userListIds.includes(parseInt(id)));
    if (invalidListIds.length > 0) {
      throw new Error('Alguna de las listas no existe o no tienes permisos');
    }

    // Obtener listas actuales del script
    const currentItems = await prisma.scriptListItem.findMany({
      where: {
        scriptId: parseInt(scriptId),
        listId: { in: userListIds }
      }
    });

    const currentListIds = currentItems.map(item => item.listId);

    // Determinar listas a añadir y eliminar
    const listsToAdd = listIds.filter(id => !currentListIds.includes(parseInt(id)));
    const listsToRemove = currentListIds.filter(id => !listIds.includes(id));

    // Ejecutar operaciones en transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar de listas
      if (listsToRemove.length > 0) {
        await tx.scriptListItem.deleteMany({
          where: {
            scriptId: parseInt(scriptId),
            listId: { in: listsToRemove }
          }
        });
      }

      // Añadir a listas
      if (listsToAdd.length > 0) {
        await tx.scriptListItem.createMany({
          data: listsToAdd.map(listId => ({
            listId: parseInt(listId),
            scriptId: parseInt(scriptId)
          }))
        });
      }
    });

    logger.info(`Listas del script ${scriptId} actualizadas por usuario ${userId}`);
  }
}

module.exports = new ScriptListService();
