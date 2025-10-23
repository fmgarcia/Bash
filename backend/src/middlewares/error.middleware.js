const logger = require('../utils/logger');

/**
 * Middleware global para manejo de errores
 */
const errorMiddleware = (err, req, res, next) => {
  // Log del error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.username || 'anonymous'
  });

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Errores de Prisma
  if (err.code && err.code.startsWith('P')) {
    let message = 'Error en la base de datos';
    let statusCode = 500;

    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      message = 'El registro ya existe';
      statusCode = 409;
    }
    // P2025: Record not found
    else if (err.code === 'P2025') {
      message = 'Registro no encontrado';
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: message,
      code: err.code
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};
