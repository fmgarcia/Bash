const express = require('express');
const rateLimit = require('express-rate-limit');
const ScriptsController = require('../controllers/scripts.controller');
const ExecutionController = require('../controllers/exec.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Rate limiter para ejecución de scripts (max 10 por minuto por usuario)
const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas ejecuciones. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rutas protegidas (usuarios y admin pueden ver scripts)
router.use(authMiddleware);

// Listado y detalle de scripts (usuarios y admin)
router.get('/', ScriptsController.getAll);
router.get('/stats', ScriptsController.getStats);
router.get('/:id', ScriptsController.getById);
router.get('/:id/versions', ScriptsController.getVersions);

// Ejecución de scripts (usuarios y admin) con rate limiting
router.post('/:id/execute', executionLimiter, ExecutionController.execute);

// Gestión de scripts (solo admin)
router.post('/', requireAdmin, ScriptsController.create);
router.put('/:id', requireAdmin, ScriptsController.update);
router.delete('/:id', requireAdmin, ScriptsController.delete);

module.exports = router;
