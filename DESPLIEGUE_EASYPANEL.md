# 🚀 Guía de Despliegue en EasyPanel (Contabo VPS)

## 📋 Requisitos Previos

- ✅ Servidor VPS en Contabo con EasyPanel instalado
- ✅ Proyecto subido a GitHub
- ✅ Acceso al panel de EasyPanel en tu servidor

---

## 🔧 Paso 1: Preparar el Proyecto en GitHub

### 1.1 Generar JWT Secrets

Antes de subir, necesitas generar los secrets JWT. Abre PowerShell en tu máquina local:

```powershell
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar JWT_REFRESH_SECRET (ejecutar de nuevo para obtener uno diferente)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ IMPORTANTE**: Guarda estos valores en un lugar seguro. Los necesitarás en el Paso 3.

### 1.2 Verificar archivos del proyecto

Asegúrate de que los siguientes archivos estén en tu repositorio:
- ✅ `Dockerfile`
- ✅ `.dockerignore`
- ✅ `gestion_scripts.sql` (para importar la base de datos)
- ✅ `.env.production.template` (plantilla, NO el .env real)

### 1.3 Subir cambios a GitHub

```powershell
cd c:\xampp\htdocs\Bash
git add .
git commit -m "feat: Add production deployment configuration with Dockerfile"
git push origin main
```

---

## 🗄️ Paso 2: Crear Base de Datos MySQL en EasyPanel

### 2.1 Acceder a EasyPanel

1. Abre tu navegador
2. Ve a: `https://TU_IP_CONTABO:3000` o `https://panel.tu-dominio.com`
3. Inicia sesión con tus credenciales

### 2.2 Crear Proyecto

1. Click en **"Create Project"**
2. Nombre del proyecto: `gestion-scripts`
3. Click en **"Create"**

### 2.3 Crear Servicio MySQL

1. Dentro del proyecto, click en **"Add Service"**
2. Selecciona **"App"** → **"MySQL"**
3. Configuración:
   - **Name**: `mysql`
   - **MySQL Root Password**: Crea una contraseña segura (guárdala)
   - **Database Name**: `gestion_scripts`
   - **MySQL User**: `root` (o crea un usuario personalizado)
   - **MySQL Password**: La misma que Root Password
4. Click en **"Deploy"**
5. **Espera** a que el servicio esté en estado "Running" (🟢)

### 2.4 Importar Base de Datos

**Opción A: Usando phpMyAdmin (si está instalado en EasyPanel)**

1. Accede a phpMyAdmin desde EasyPanel
2. Selecciona la base de datos `gestion_scripts`
3. Ve a la pestaña **"Import"**
4. Sube el archivo `gestion_scripts.sql` de tu repositorio
5. Click en **"Go"**

**Opción B: Usando MySQL CLI desde terminal**

1. En EasyPanel, ve al servicio MySQL
2. Click en **"Terminal"** o conéctate por SSH a tu VPS
3. Ejecuta:

```bash
# Conectar al contenedor MySQL
docker exec -i $(docker ps -qf "name=mysql") mysql -u root -p gestion_scripts < gestion_scripts.sql
# Te pedirá la contraseña que configuraste
```

**Opción C: Copiar SQL y ejecutar manualmente**

1. Copia el contenido de `gestion_scripts.sql`
2. Accede a la terminal del servicio MySQL en EasyPanel
3. Ejecuta:

```bash
mysql -u root -p gestion_scripts
# Pega el contenido del SQL y presiona Enter
```

---

## 🐳 Paso 3: Desplegar la Aplicación

### 3.1 Agregar Servicio de la Aplicación

1. En el proyecto `gestion-scripts`, click en **"Add Service"**
2. Selecciona **"App"** → **"GitHub Repository"**
3. Configuración:

   **General:**
   - **Name**: `backend`
   - **Repository**: Selecciona tu repositorio de GitHub
   - **Branch**: `main` (o la rama que uses)

   **Build:**
   - **Build Method**: Cambia de "Nixpacks" a **"Dockerfile"**
   - **Dockerfile Path**: `Dockerfile` (debe estar en la raíz)

   **Port:**
   - **Port**: `4000`

### 3.2 Configurar Variables de Entorno

1. En la misma pantalla, ve a la sección **"Environment Variables"**
2. Agrega las siguientes variables:

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `mysql://root:TU_PASSWORD@mysql:3306/gestion_scripts` | Usa la contraseña del Paso 2.3 |
| `JWT_SECRET` | `tu_jwt_secret_del_paso_1.1` | 64 caracteres hex |
| `JWT_REFRESH_SECRET` | `tu_jwt_refresh_secret_del_paso_1.1` | 64 caracteres hex (diferente) |
| `FRONTEND_URL` | `https://tu-dominio.com` | O el dominio que te asigne EasyPanel |
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | |
| `EXECUTION_MODE` | `headless` | |
| `LOG_LEVEL` | `info` | |
| `TMP_SCRIPT_DIR` | `/app/tmp` | |

**⚠️ IMPORTANTE sobre DATABASE_URL:**
- El host debe ser `mysql` (nombre del servicio MySQL en EasyPanel)
- Si creaste un usuario personalizado en MySQL, úsalo en lugar de `root`
- Asegúrate de que la contraseña sea correcta

### 3.3 Conectar con MySQL

1. En la sección **"Service Dependencies"** o **"Networks"**
2. Asegúrate de que el servicio `backend` esté conectado al servicio `mysql`
3. EasyPanel debería hacerlo automáticamente si están en el mismo proyecto

### 3.4 Desplegar

1. Click en **"Deploy"**
2. EasyPanel comenzará a:
   - Clonar el repositorio
   - Construir la imagen Docker
   - Instalar PowerShell Core
   - Compilar el frontend
   - Desplegar el backend
3. **Espera** 5-10 minutos (primera vez puede tardar más)

### 3.5 Verificar Estado

1. Ve a la pestaña **"Logs"** para ver el progreso
2. Busca mensajes como:
   ```
   ✅ Servidor corriendo en puerto 4000
   ✅ Conectado a la base de datos
   ✅ PowerShell disponible: /usr/bin/pwsh
   ```
3. El estado del servicio debe cambiar a **"Running"** (🟢)

---

## 🌐 Paso 4: Configurar Dominio y SSL

### 4.1 Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. Ve a tu proveedor de DNS
2. Crea un registro A:
   - **Host**: `@` o `scripts` (para subdominio)
   - **Value**: IP de tu servidor Contabo
   - **TTL**: 3600 (o el predeterminado)

3. En EasyPanel:
   - Ve al servicio `backend`
   - Sección **"Domains"**
   - Click en **"Add Domain"**
   - Ingresa tu dominio: `scripts.tu-dominio.com`
   - Marca **"Enable SSL"** (Let's Encrypt automático)
   - Click en **"Add"**

### 4.2 Usar Subdominio de EasyPanel

Si no tienes dominio:

1. EasyPanel te asignará un subdominio automáticamente
2. Será algo como: `backend-gestion-scripts.tu-ip.sslip.io`
3. Cópialo y actualiza la variable `FRONTEND_URL` con esta URL

---

## ✅ Paso 5: Verificar Funcionamiento

### 5.1 Probar el Health Check

1. Abre tu navegador
2. Ve a: `https://tu-dominio.com/health`
3. Deberías ver:

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-XX..."
}
```

### 5.2 Acceder a la Aplicación

1. Ve a: `https://tu-dominio.com`
2. Deberías ver la pantalla de login
3. Inicia sesión con las credenciales de `gestion_scripts.sql`

### 5.3 Verificar PowerShell

1. En EasyPanel, ve al servicio `backend`
2. Click en **"Terminal"**
3. Ejecuta:

```bash
pwsh --version
```

Deberías ver: `PowerShell 7.4.0`

---

## 🔧 Troubleshooting (Resolución de Problemas)

### ❌ Error: "Cannot connect to database"

**Solución:**
1. Verifica que el servicio MySQL esté Running
2. Revisa la variable `DATABASE_URL`:
   - Host debe ser `mysql` (no `localhost`)
   - Contraseña correcta
   - Base de datos `gestion_scripts` existe
3. Reinicia el servicio `backend`

### ❌ Error: "JWT must be provided"

**Solución:**
1. Verifica que las variables `JWT_SECRET` y `JWT_REFRESH_SECRET` estén configuradas
2. Deben ser strings de 64 caracteres hexadecimales
3. No deben tener espacios ni caracteres especiales

### ❌ Error: "PowerShell not found"

**Solución:**
1. Revisa los logs de construcción de Docker
2. Asegúrate de que el Dockerfile se esté usando (no Nixpacks)
3. Si falla la instalación de PowerShell, intenta reconstruir:
   - Ve al servicio → **"Redeploy"**

### ❌ Página en blanco / 404 en rutas

**Solución:**
1. Verifica que `NODE_ENV=production` esté configurado
2. Revisa los logs del backend para errores
3. El frontend debería estar en `/app/public` dentro del contenedor

### ❌ Scripts no se ejecutan

**Solución:**
1. Verifica que PowerShell esté instalado: `pwsh --version` en terminal
2. Revisa `TMP_SCRIPT_DIR=/app/tmp` en variables de entorno
3. Los scripts de Windows (.bat, .cmd) NO funcionarán en Linux
4. Solo scripts PowerShell (.ps1) son compatibles

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs en Tiempo Real

1. En EasyPanel, ve al servicio `backend`
2. Click en **"Logs"**
3. Activa **"Live Logs"**

### Reiniciar la Aplicación

1. Ve al servicio `backend`
2. Click en **"Restart"**

### Actualizar la Aplicación

Cuando hagas cambios en GitHub:

1. Push a la rama `main`
2. En EasyPanel, ve al servicio `backend`
3. Click en **"Redeploy"**
4. EasyPanel automáticamente:
   - Descargará los cambios
   - Reconstruirá la imagen Docker
   - Reiniciará el servicio

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- 🌐 **Frontend + Backend**: `https://tu-dominio.com`
- 🔌 **API**: `https://tu-dominio.com/api/*`
- 💓 **Health Check**: `https://tu-dominio.com/health`

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en EasyPanel
2. **Verifica las variables** de entorno
3. **Comprueba la conexión** entre servicios
4. **Consulta la documentación** de EasyPanel: https://easypanel.io/docs

---

**Autor**: GitHub Copilot  
**Fecha**: 2024  
**Versión**: 1.0
