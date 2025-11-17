require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const PowerShellHelper = require('./utils/powershell-helper');
const { PrismaClient } = require('@prisma/client');

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Función async para iniciar el servidor
async function startServer() {
  try {
    // Validar variables de entorno requeridas
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      logger.error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
      process.exit(1);
    }

    // Verificar conexión a base de datos
    logger.info('Verificando conexión a base de datos...');
    await prisma.$connect();
    logger.info('✅ Conectado a la base de datos exitosamente');

    // Validar que PowerShell está disponible
    const psHelper = new PowerShellHelper();
    const isAvailable = await psHelper.validatePowerShell();
    
    if (!isAvailable) {
      logger.warn('⚠️  PowerShell no está disponible - Funcionalidad de scripts limitada');
    } else {
      logger.info('✅ PowerShell validado correctamente');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`===========================================`);
      logger.info(`✅ Servidor corriendo en puerto ${PORT}`);
      logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Modo de ejecución: ${process.env.EXECUTION_MODE || 'headless'}`);
      logger.info(`Directorio temporal: ${process.env.TMP_SCRIPT_DIR || 'tmp/'}`);
      logger.info(`===========================================`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${PORT} ya está en uso`);
      } else {
        logger.error('❌ Error del servidor:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} recibido. Cerrando servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        
        try {
          await prisma.$disconnect();
          logger.info('Conexión a BD cerrada');
        } catch (err) {
          logger.error('Error cerrando BD:', err);
        }
        
        process.exit(0);
      });

      // Forzar salida después de 10 segundos
      setTimeout(() => {
        logger.error('Timeout en graceful shutdown. Forzando salida...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Error fatal iniciando servidor:', error);
    
    if (error.code === 'P1001') {
      logger.error('No se puede conectar a la base de datos. Verifica DATABASE_URL');
    } else if (error.code === 'P1003') {
      logger.error('Base de datos no encontrada. Verifica que existe "gestion_scripts"');
    }
    
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

// Manejo de errores no capturados (después de iniciar)
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
