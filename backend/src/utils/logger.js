const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Transport para archivos rotativos diarios
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'info',
  format: customFormat
});

// Transport para errores
const errorFileTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error',
  format: customFormat
});

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    fileRotateTransport,
    errorFileTransport
  ]
});

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }));
}

module.exports = logger;
