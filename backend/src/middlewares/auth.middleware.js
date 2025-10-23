const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware para verificar el token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Eliminar 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      roleId: decoded.roleId,
      roleName: decoded.roleName
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    logger.error(`Error en authMiddleware: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error verificando autenticación'
    });
  }
};

module.exports = authMiddleware;
