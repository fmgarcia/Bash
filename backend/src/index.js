require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const PowerShellHelper = require('./utils/powershell-helper');

const PORT = process.env.PORT || 4000;

// Validar variables de entorno requeridas
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Validar que PowerShell está disponible
const psHelper = new PowerShellHelper();
psHelper.validatePowerShell()
  .then(isAvailable => {
    if (!isAvailable) {
      logger.error('PowerShell no está disponible en el sistema');
      logger.error('Este servidor requiere PowerShell para funcionar');
      process.exit(1);
    } else {
      logger.info('PowerShell validado correctamente');
    }
  })
  .catch(error => {
    logger.error(`Error validando PowerShell: ${error.message}`);
  });

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`===========================================`);
  logger.info(`Servidor iniciado en puerto ${PORT}`);
  logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Modo de ejecución: ${process.env.EXECUTION_MODE || 'headless'}`);
  logger.info(`Directorio temporal: ${process.env.TMP_SCRIPT_DIR || 'tmp/'}`);
  logger.info(`===========================================`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});
