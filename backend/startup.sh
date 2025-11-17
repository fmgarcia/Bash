#!/bin/bash
set -e

echo "=== INICIO DEL STARTUP SCRIPT ==="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

echo "✅ DATABASE_URL configurada"
echo "Conectando a: ${DATABASE_URL%%:*}://***@***"

# Verificar que PowerShell está disponible
if command -v pwsh &> /dev/null; then
    echo "✅ PowerShell encontrado: $(pwsh --version)"
else
    echo "⚠️  ADVERTENCIA: PowerShell no encontrado"
fi

# Verificar directorio temporal
if [ ! -d "$TMP_SCRIPT_DIR" ]; then
    echo "Creando directorio temporal: $TMP_SCRIPT_DIR"
    mkdir -p "$TMP_SCRIPT_DIR"
fi
echo "✅ Directorio temporal: $TMP_SCRIPT_DIR"

# Probar conexión a la base de datos
echo "Verificando conexión a base de datos..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Base de datos verificada exitosamente');
    return prisma.\$disconnect();
  })
  .catch((err) => {
    console.error('❌ ERROR conectando a base de datos:', err.message);
    process.exit(1);
  });
" || exit 1

echo "✅ Verificaciones completadas"
echo "=== INICIANDO SERVIDOR EN PUERTO $PORT ==="

# Iniciar el servidor
exec node src/index.js
