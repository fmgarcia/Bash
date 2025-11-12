const express = require('express');
const router = express.Router();
const scriptListController = require('../controllers/scriptList.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de listas
router.get('/', scriptListController.getUserLists);
router.get('/:id', scriptListController.getListById);
router.post('/', scriptListController.createList);
router.patch('/:id', scriptListController.updateList);
router.delete('/:id', scriptListController.deleteList);

// Rutas para gestionar scripts en listas
router.post('/:id/scripts', scriptListController.addScriptToList);
router.delete('/:id/scripts/:scriptId', scriptListController.removeScriptFromList);

// Rutas para obtener/actualizar listas de un script
router.get('/scripts/:scriptId/lists', scriptListController.getScriptLists);
router.put('/scripts/:scriptId/lists', scriptListController.updateScriptLists);

module.exports = router;
