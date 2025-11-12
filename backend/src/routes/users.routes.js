const express = require('express');
const UsersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin, requireAdminOrEmpresa } = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas que permiten admin o empresa
router.get('/', requireAdminOrEmpresa, UsersController.getAll);
router.get('/:id', requireAdminOrEmpresa, UsersController.getById);
router.post('/', requireAdminOrEmpresa, UsersController.create);
router.put('/:id', requireAdminOrEmpresa, UsersController.update);
router.delete('/:id', requireAdminOrEmpresa, UsersController.delete);

// Ruta solo para admin
router.get('/stats', requireAdmin, UsersController.getStats);

module.exports = router;
