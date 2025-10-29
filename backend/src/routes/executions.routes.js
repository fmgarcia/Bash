const express = require('express');
const ExecutionController = require('../controllers/exec.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener historial de ejecuciones
router.get('/', ExecutionController.getExecutions);

// Obtener estadísticas de ejecuciones
router.get('/stats', ExecutionController.getStats);

// Obtener una ejecución específica
router.get('/:id', ExecutionController.getExecutionById);

// Actualizar comentarios de una ejecución
router.patch('/:id/comentarios', ExecutionController.updateComentarios);

module.exports = router;
