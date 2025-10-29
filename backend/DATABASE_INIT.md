# Base de Datos Inicializada

## ✅ Estado Actual

La base de datos ha sido inicializada correctamente con:

### 👥 Usuarios (2)

1. **Administrador**
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Email: `admin@gestion-scripts.local`
   - Rol: ADMIN
   - Permisos: Acceso completo (crear/editar/eliminar scripts, gestión de usuarios)

2. **Usuario Estándar**
   - Usuario: `user`
   - Contraseña: `user123`
   - Email: `user@gestion-scripts.local`
   - Rol: USER
   - Permisos: Ver y ejecutar scripts

### 📜 Scripts (10)

1. **Ping a Host** - Realiza ping a un host específico
2. **Información del Sistema** - Obtiene información del SO
3. **Listar Procesos por Uso de CPU** - Top procesos por CPU
4. **Espacio en Disco** - Muestra espacio en unidades
5. **Servicios de Windows** - Lista servicios por estado
6. **Test de Puerto** - Verifica si un puerto está abierto
7. **Limpiar Archivos Temporales** - Limpieza del sistema
8. **Usuarios Locales** - Lista usuarios del sistema
9. **Eventos del Sistema** - Muestra eventos recientes
10. **Información de Red** - Configuración de red

## 🔐 Seguridad

- Las contraseñas están encriptadas con **bcrypt** (SALT_ROUNDS=12)
- Hash de 60 caracteres generado automáticamente

## 🚀 Comandos Útiles

### Reinicializar la base de datos
```bash
npm run db:seed
```

### Verificar contenido de la base de datos
```bash
node scripts/verify-database.js
```

### Verificar usuario específico
```bash
node scripts/check-user.js
```

## 📁 Estructura de Archivos

```
backend/
├── prisma/
│   ├── schema.prisma       # Esquema de la base de datos
│   └── seed.js            # Script de inicialización
└── scripts/
    ├── verify-database.js # Verificación completa
    └── check-user.js      # Verificar usuarios
```

## 🔄 Actualizaciones

Si necesitas agregar más scripts o usuarios, puedes:
1. Modificar `prisma/seed.js`
2. Ejecutar `npm run db:seed` para actualizar

El script es idempotente: actualiza registros existentes y crea los nuevos.
