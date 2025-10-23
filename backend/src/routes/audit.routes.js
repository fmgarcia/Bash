const express = require('express');
const ExecutionController = require('../controllers/exec.controller');
const AuditController = require('../controllers/audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Historial de ejecuciones (usuarios ven las suyas, admin ve todas)
router.get('/executions', ExecutionController.getExecutions);
router.get('/executions/stats', ExecutionController.getStats);
router.get('/executions/:id', ExecutionController.getExecutionById);

// Auditoría (solo admin)
router.get('/audit', requireAdmin, AuditController.getAuditTrail);

module.exports = router;
