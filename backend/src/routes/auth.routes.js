const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas públicas
router.post('/register', AuthController.validateRegister, AuthController.register);
router.post('/login', AuthController.validateLogin, AuthController.login);
router.post('/refresh', AuthController.refresh);

// Rutas protegidas
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.post('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;
