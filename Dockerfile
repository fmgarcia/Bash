# Multi-stage build para optimizar el tamaño

# Stage 1: Build del Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend con Frontend compilado
FROM node:18-alpine
WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma y PowerShell
RUN apk add --no-cache openssl curl bash icu-libs

# Instalar PowerShell Core para Linux
RUN curl -L https://github.com/PowerShell/PowerShell/releases/download/v7.4.0/powershell-7.4.0-linux-musl-x64.tar.gz -o /tmp/powershell.tar.gz \
    && mkdir -p /opt/microsoft/powershell/7 \
    && tar zxf /tmp/powershell.tar.gz -C /opt/microsoft/powershell/7 \
    && chmod +x /opt/microsoft/powershell/7/pwsh \
    && ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh \
    && rm /tmp/powershell.tar.gz

# Copiar archivos del backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copiar código del backend
COPY backend/ ./

# Copiar build del frontend al directorio public
COPY --from=frontend-build /app/frontend/dist ./public

# Generar cliente Prisma
RUN npx prisma generate

# Crear directorio temporal para scripts
RUN mkdir -p /app/tmp

# Exponer puerto
EXPOSE 4000

# Variables de entorno por defecto (se pueden sobrescribir)
ENV NODE_ENV=production
ENV PORT=4000
ENV TMP_SCRIPT_DIR=/app/tmp
ENV EXECUTION_MODE=headless

# Comando de inicio
CMD ["node", "src/index.js"]
