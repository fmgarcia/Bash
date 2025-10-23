# 🔷 Gestión de Scripts PowerShell - Local

Sistema completo de gestión y ejecución de scripts PowerShell para instalación local en Windows con MySQL (XAMPP).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Seguridad](#seguridad)
- [Arquitectura](#arquitectura)
- [Uso](#uso)
- [Troubleshooting](#troubleshooting)

## ✨ Características

- 🔐 **Autenticación JWT** con access y refresh tokens
- 👥 **Sistema de roles** (Admin/User)
- 📜 **Gestión completa de scripts** PowerShell
- ▶️ **Ejecución de scripts** con dos modos:
  - **Visible**: Abre ventana de PowerShell (requiere sesión UI)
  - **Headless**: Captura salida sin ventana visible
- 🔍 **Búsqueda y filtrado** de scripts (nombre, descripción, tags)
- 📊 **Dashboard con estadísticas** y métricas
- 📝 **Versionado automático** de scripts
- 🔄 **Historial de ejecuciones** con stdout/stderr
- 🛡️ **Validación y sanitización** de parámetros
- 📋 **Registro de auditoría** completo
- 🎨 **Interfaz moderna** con React + Tailwind CSS
- ⚡ **Rate limiting** para prevenir abusos

## 🛠️ Tecnologías

### Backend
- Node.js (>=16)
- Express.js
- Prisma ORM
- MySQL (MariaDB)
- JWT (jsonwebtoken)
- bcrypt (hash de contraseñas)
- Winston (logging)

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descargar de: https://nodejs.org/
   - Verificar: `node --version` y `npm --version`

2. **XAMPP** (o cualquier stack con MySQL/MariaDB)
   - Descargar de: https://www.apachefriends.org/
   - Asegurarse de que MySQL esté corriendo en puerto 3306

3. **PowerShell** (ya viene con Windows)
   - Verificar: `powershell -Command "Write-Output test"`

4. **Git** (opcional, para clonar repositorio)

## 🚀 Instalación

### Paso 1: Clonar o Descargar el Proyecto

```bash
cd C:\xampp\htdocs
# Si tienes git:
git clone <tu-repositorio> Bash
# O simplemente extrae el ZIP en C:\xampp\htdocs\Bash
```

### Paso 2: Importar Base de Datos

1. Abrir **XAMPP Control Panel**
2. Iniciar **Apache** y **MySQL**
3. Abrir **phpMyAdmin** → http://localhost/phpmyadmin
4. Crear nueva base de datos llamada `gestion_scripts`
5. Importar el archivo `gestion_scripts.sql`:
   - Clic en la base de datos `gestion_scripts`
   - Ir a la pestaña **Importar**
   - Seleccionar `gestion_scripts.sql`
   - Clic en **Continuar**

### Paso 3: Instalar Dependencias del Backend

```bash
cd C:\xampp\htdocs\Bash\backend
npm install
```

### Paso 4: Configurar Variables de Entorno del Backend

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
```

Editar `backend\.env` con tus configuraciones:

```env
DATABASE_URL="mysql://root:@localhost:3306/gestion_scripts"
JWT_SECRET="tu_secreto_jwt_muy_seguro_cambiar_en_produccion_XYZ123"
JWT_REFRESH_SECRET="tu_secreto_refresh_muy_seguro_cambiar_en_produccion_ABC456"
PORT=4000
FRONTEND_URL="http://localhost:3000"
TMP_SCRIPT_DIR="C:\\gestion-scripts\\tmp"
EXECUTION_MODE="headless"
LOG_LEVEL="info"
NODE_ENV="development"
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores únicos y seguros.

### Paso 5: Generar Cliente Prisma

```bash
cd C:\xampp\htdocs\Bash\backend
npx prisma generate
```

### Paso 6: Crear Usuario Administrador Inicial

```bash
cd C:\xampp\htdocs\Bash\backend
node scripts\create-admin.js
```

Sigue las instrucciones en pantalla para crear el primer admin:
- Username (ej: admin)
- Email (opcional)
- Nombre completo (opcional)
- Contraseña (mínimo 8 caracteres con mayúsculas, minúsculas y números)
- Confirmar contraseña

### Paso 7: Instalar Dependencias del Frontend

```bash
cd C:\xampp\htdocs\Bash\frontend
npm install
```

### Paso 8: Configurar Variables de Entorno del Frontend

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
```

El archivo `frontend\.env` debería contener:

```env
VITE_API_URL=http://localhost:4000/api
```

## ▶️ Ejecución

### Ejecutar Backend

```bash
cd C:\xampp\htdocs\Bash\backend
npm run dev
```

El servidor backend estará corriendo en: **http://localhost:4000**

### Ejecutar Frontend (en otra terminal)

```bash
cd C:\xampp\htdocs\Bash\frontend
npm run dev
```

El frontend estará corriendo en: **http://localhost:3000**

### Acceder a la Aplicación

1. Abrir navegador en **http://localhost:3000**
2. Iniciar sesión con las credenciales del admin creado anteriormente

## 🔒 Seguridad

### Consideraciones Importantes

⚠️ **ADVERTENCIA**: Este software ejecuta comandos PowerShell en la máquina donde corre el servidor backend.

#### Implementaciones de Seguridad

1. **Autenticación y Autorización**
   - JWT con tokens de corta duración (15min access, 7d refresh)
   - Contraseñas hasheadas con bcrypt (cost 12)
   - Sistema de roles (Admin/User)

2. **Sanitización de Inputs**
   - Validación de parámetros según `parametersSchema`
   - Eliminación de caracteres peligrosos (`;`, `|`, `&`, etc.)
   - Reemplazo seguro de placeholders (`{{paramName}}`)
   - Sin concatenación directa de comandos

3. **Rate Limiting**
   - Máximo 10 ejecuciones por minuto por usuario
   - Prevención de ataques de denegación de servicio

4. **Registro y Auditoría**
   - Logs detallados con Winston (rotación diaria)
   - Tabla `audit_trail` para todas las operaciones críticas
   - Tabla `execution_logs` con stdout/stderr completo

5. **Validación de Esquemas**
   - `parametersSchema` define tipos y restricciones
   - Solo se aceptan parámetros definidos en el schema

#### Limitaciones y Advertencias

- ❗ **El servidor ejecuta scripts en la máquina local donde corre**
- ❗ Si el backend corre como servicio o bajo otra cuenta, el modo `visible` puede no abrir ventanas
- ❗ En producción, usar usuario MySQL con permisos mínimos (no root)
- ❗ Solo usar en entornos controlados y de confianza
- ❗ Los administradores pueden ejecutar cualquier código PowerShell

### Recomendaciones de Producción

```env
# Usar contraseñas fuertes
JWT_SECRET="<generar con: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\">"
JWT_REFRESH_SECRET="<generar con: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\">"

# Crear usuario MySQL dedicado
DATABASE_URL="mysql://gestion_scripts_user:contraseña_segura@localhost:3306/gestion_scripts"

# Modo producción
NODE_ENV="production"

# Limitar CORS
FRONTEND_URL="https://tu-dominio.com"
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
gestion-scripts-local/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── middlewares/       # Auth, roles, errores
│   │   ├── utils/             # Logger, sanitize, powershell-helper
│   │   ├── routes/            # Definición de rutas
│   │   ├── prisma/            # Schema Prisma
│   │   ├── app.js             # Configuración Express
│   │   └── index.js           # Punto de entrada
│   ├── scripts/               # Scripts de utilidad
│   ├── logs/                  # Logs (generado automáticamente)
│   ├── .env                   # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # Páginas React
│   │   ├── components/        # Componentes reutilizables
│   │   ├── services/          # API client (Axios)
│   │   ├── hooks/             # Custom hooks (useAuth)
│   │   ├── App.jsx            # Router principal
│   │   └── main.jsx           # Punto de entrada
│   ├── .env                   # Variables de entorno
│   └── package.json
└── README.md                  # Este archivo
```

### Flujo de Ejecución de Scripts

1. **Usuario** selecciona script y proporciona parámetros
2. **Frontend** muestra modal de confirmación
3. **Backend** recibe request en `/api/scripts/:id/execute`
4. **Validación**: 
   - Verifica permisos del usuario
   - Valida parámetros contra `parametersSchema`
   - Sanitiza inputs
5. **Preparación**:
   - Reemplaza placeholders `{{param}}` en el body del script
   - Crea archivo temporal en `C:\gestion-scripts\tmp\`
6. **Ejecución**:
   - Modo `headless`: Captura stdout/stderr
   - Modo `visible`: Abre ventana de PowerShell
7. **Registro**:
   - Guarda resultado en `execution_logs`
   - Registra acción en `audit_trail`
   - Elimina archivo temporal

### Modos de Ejecución

#### Modo Headless (por defecto)
```env
EXECUTION_MODE="headless"
```
- ✅ Captura stdout/stderr completo
- ✅ Funciona en servicios sin UI
- ✅ Timeout configurable (default 5min)
- ❌ No muestra ventana al usuario

#### Modo Visible
```env
EXECUTION_MODE="visible"
```
- ✅ Abre ventana de PowerShell
- ✅ Usuario ve ejecución en tiempo real
- ❌ Requiere sesión de usuario con UI
- ❌ No captura stdout (se pierde cuando cierra la ventana)

## 📖 Uso

### Para Usuarios Normales

1. **Ver Scripts**:
   - Navegar a "Scripts"
   - Usar barra de búsqueda para filtrar
   - Clic en script para ver detalles

2. **Ejecutar Script**:
   - Clic en "Ver Detalle"
   - Llenar parámetros requeridos
   - Clic en "▶️ Ejecutar Script"
   - Confirmar ejecución
   - Ver resultado en modal

3. **Descargar Logs**:
   - Después de ejecutar, clic en "📥 Descargar Log"

### Para Administradores

1. **Crear Script**:
   - Clic en "+ Nuevo Script"
   - Llenar formulario:
     - Nombre, descripción
     - Código PowerShell
     - Parameters Schema (JSON)
     - Tags
   - Clic en "Crear Script"

2. **Editar Script**:
   - En listado de scripts, clic en "✏️"
   - Modificar campos necesarios
   - Si cambias el `body`, se incrementa la versión automáticamente

3. **Gestionar Usuarios**:
   - Navegar a "Usuarios"
   - Crear/Editar/Eliminar usuarios
   - Asignar roles (Admin/User)

### Ejemplo de Parameters Schema

```json
{
  "computerName": {
    "type": "string",
    "required": true,
    "description": "Nombre del equipo",
    "pattern": "^[a-zA-Z0-9-]+$",
    "maxLength": 15
  },
  "port": {
    "type": "integer",
    "required": false,
    "default": 3389,
    "min": 1,
    "max": 65535
  },
  "verbose": {
    "type": "boolean",
    "default": false
  }
}
```

### Ejemplo de Script con Placeholders

```powershell
# Script: Ping a Equipo
$computerName = "{{computerName}}"
$count = {{count}}

Write-Output "Haciendo ping a $computerName ($count veces)..."

Test-Connection -ComputerName $computerName -Count $count

Write-Output "Ping completado."
```

## 🐛 Troubleshooting

### Backend no inicia

**Problema**: Error de conexión a MySQL
```
Error: Can't connect to MySQL server
```

**Solución**:
1. Verificar que MySQL está corriendo en XAMPP
2. Verificar `DATABASE_URL` en `.env`
3. Confirmar que la base de datos `gestion_scripts` existe

---

**Problema**: Error de Prisma
```
Error: Prisma Client not generated
```

**Solución**:
```bash
cd backend
npx prisma generate
```

---

### Frontend no conecta con Backend

**Problema**: Error CORS o "Network Error"

**Solución**:
1. Verificar que el backend está corriendo en `http://localhost:4000`
2. Verificar `VITE_API_URL` en `frontend\.env`
3. Comprobar que no hay firewall bloqueando puertos

---

### PowerShell no ejecuta scripts

**Problema**: "PowerShell no está disponible"

**Solución**:
1. Abrir CMD y ejecutar:
   ```cmd
   powershell -Command "Write-Output test"
   ```
2. Si falla, reinstalar PowerShell desde Windows Features

---

**Problema**: Scripts en modo "visible" no abren ventana

**Solución**:
- El backend debe correr en sesión de usuario (no como servicio)
- Usar modo `headless` si el backend corre en background
- Cambiar en `.env`: `EXECUTION_MODE="headless"`

---

### No puedo iniciar sesión

**Problema**: "Credenciales inválidas"

**Solución**:
1. Verificar que el usuario fue creado correctamente con `create-admin.js`
2. Revisar logs en `backend\logs\`
3. Intentar crear nuevo admin:
   ```bash
   cd backend
   node scripts\create-admin.js
   ```

---

### Error "Token expirado"

**Problema**: El access token expira cada 15 minutos

**Solución**:
- El sistema debería refrescar automáticamente
- Si persiste, cerrar sesión y volver a iniciar

---

## 📝 Scripts Disponibles

### Backend

```bash
npm run dev         # Ejecutar en modo desarrollo con nodemon
npm start           # Ejecutar en modo producción
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:studio      # Abrir Prisma Studio (GUI para DB)
npm test            # Ejecutar tests
```

### Frontend

```bash
npm run dev         # Ejecutar en modo desarrollo
npm run build       # Compilar para producción
npm run preview     # Vista previa de build de producción
```

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📄 Licencia

Este proyecto está bajo Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## ✉️ Soporte

Para preguntas, problemas o sugerencias:

- Crear un Issue en el repositorio
- Contactar al administrador del sistema

---

## 🔄 Changelog

### v1.0.0 (2025-10-23)
- ✅ Lanzamiento inicial
- ✅ Sistema completo de autenticación JWT
- ✅ Gestión CRUD de scripts
- ✅ Ejecución de scripts PowerShell (modo visible y headless)
- ✅ Dashboard con estadísticas
- ✅ Historial de ejecuciones
- ✅ Sistema de auditoría
- ✅ Interfaz React con Tailwind CSS

---

**¡Gracias por usar Gestión de Scripts PowerShell!** 🚀

