const scriptListService = require('../services/scriptList.service');
const logger = require('../utils/logger');

/**
 * Obtiene todas las listas del usuario autenticado
 */
exports.getUserLists = async (req, res) => {
  try {
    const lists = await scriptListService.getUserLists(req.user.id);
    res.json(lists);
  } catch (error) {
    logger.error('Error obteniendo listas:', error);
    res.status(500).json({ message: 'Error obteniendo las listas' });
  }
};

/**
 * Obtiene una lista específica con sus scripts
 */
exports.getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await scriptListService.getListById(id, req.user.id);
    res.json(list);
  } catch (error) {
    logger.error('Error obteniendo lista:', error);
    if (error.message.includes('no encontrada') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error obteniendo la lista' });
    }
  }
};

/**
 * Crea una nueva lista
 */
exports.createList = async (req, res) => {
  try {
    const list = await scriptListService.createList(req.user.id, req.body);
    res.status(201).json(list);
  } catch (error) {
    logger.error('Error creando lista:', error);
    if (error.message.includes('ya existe')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error creando la lista' });
    }
  }
};

/**
 * Actualiza una lista
 */
exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await scriptListService.updateList(id, req.user.id, req.body);
    res.json(list);
  } catch (error) {
    logger.error('Error actualizando lista:', error);
    if (error.message.includes('no encontrada') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('No puedes')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error actualizando la lista' });
    }
  }
};

/**
 * Elimina una lista
 */
exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    await scriptListService.deleteList(id, req.user.id);
    res.json({ message: 'Lista eliminada correctamente' });
  } catch (error) {
    logger.error('Error eliminando lista:', error);
    if (error.message.includes('no encontrada') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('No puedes')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error eliminando la lista' });
    }
  }
};

/**
 * Añade un script a una lista
 */
exports.addScriptToList = async (req, res) => {
  try {
    const { id } = req.params;
    const { scriptId, notes } = req.body;
    
    const item = await scriptListService.addScriptToList(id, scriptId, req.user.id, notes);
    res.status(201).json(item);
  } catch (error) {
    logger.error('Error añadiendo script a lista:', error);
    if (error.message.includes('no encontrada') || error.message.includes('no encontrado') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('ya está')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error añadiendo el script a la lista' });
    }
  }
};

/**
 * Elimina un script de una lista
 */
exports.removeScriptFromList = async (req, res) => {
  try {
    const { id, scriptId } = req.params;
    await scriptListService.removeScriptFromList(id, scriptId, req.user.id);
    res.json({ message: 'Script eliminado de la lista' });
  } catch (error) {
    logger.error('Error eliminando script de lista:', error);
    if (error.message.includes('no encontrada') || error.message.includes('no está') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error eliminando el script de la lista' });
    }
  }
};

/**
 * Obtiene las listas que contienen un script
 */
exports.getScriptLists = async (req, res) => {
  try {
    const { scriptId } = req.params;
    const lists = await scriptListService.getScriptLists(scriptId, req.user.id);
    res.json(lists);
  } catch (error) {
    logger.error('Error obteniendo listas del script:', error);
    res.status(500).json({ message: 'Error obteniendo las listas del script' });
  }
};

/**
 * Actualiza las listas de un script (añade/elimina de múltiples listas)
 */
exports.updateScriptLists = async (req, res) => {
  try {
    const { scriptId } = req.params;
    const { listIds } = req.body;
    
    if (!Array.isArray(listIds)) {
      return res.status(400).json({ message: 'listIds debe ser un array' });
    }
    
    await scriptListService.updateScriptLists(scriptId, req.user.id, listIds);
    res.json({ message: 'Listas actualizadas correctamente' });
  } catch (error) {
    logger.error('Error actualizando listas del script:', error);
    if (error.message.includes('no encontrado') || error.message.includes('permisos')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error actualizando las listas' });
    }
  }
};
