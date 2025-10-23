const express = require('express');
const UsersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware, requireAdmin);

router.get('/', UsersController.getAll);
router.get('/stats', UsersController.getStats);
router.get('/:id', UsersController.getById);
router.post('/', UsersController.create);
router.put('/:id', UsersController.update);
router.delete('/:id', UsersController.delete);

module.exports = router;
