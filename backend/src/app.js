const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const scriptsRoutes = require('./routes/scripts.routes');
const executionsRoutes = require('./routes/executions.routes');
const auditRoutes = require('./routes/audit.routes');
const scriptListRoutes = require('./routes/scriptList.routes');

const app = express();

// Configurar serialización de BigInt para JSON
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/executions', executionsRoutes);
app.use('/api/script-lists', scriptListRoutes);
app.use('/api', auditRoutes);

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'public');
  app.use(express.static(frontendPath));
  
  // Todas las rutas no API devuelven index.html (SPA routing)
  app.get('*', (req, res) => {
    // Solo si no es una ruta de API
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Middleware para rutas no encontradas (solo API en producción)
app.use(notFoundMiddleware);

// Middleware global de manejo de errores
app.use(errorMiddleware);

module.exports = app;
