/**
 * Middleware para verificar roles
 */

/**
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param  {...string} allowedRoles - Roles permitidos ('admin', 'user', etc.)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const userRole = req.user.roleName;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        yourRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware específico para requerir rol admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware que permite admin y user
 */
const requireAuthenticated = requireRole('admin', 'user');

module.exports = {
  requireRole,
  requireAdmin,
  requireAuthenticated
};
