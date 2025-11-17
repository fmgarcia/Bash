const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('\n===========================================');
  console.log('   INICIALIZANDO BASE DE DATOS');
  console.log('===========================================\n');

  try {
    // 1. Crear roles
    console.log('📋 Creando roles...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {
        description: 'Administrador con permisos completos (crear/editar/borrar scripts, gestión de usuarios)'
      },
      create: {
        name: 'admin',
        description: 'Administrador con permisos completos (crear/editar/borrar scripts, gestión de usuarios)'
      }
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {
        description: 'Usuario estándar: solo puede ver y ejecutar scripts'
      },
      create: {
        name: 'user',
        description: 'Usuario estándar: solo puede ver y ejecutar scripts'
      }
    });
    console.log('✅ Roles creados correctamente\n');

    // 2. Crear usuarios
    console.log('👥 Creando usuarios...');
    
    // Usuario admin
    const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        fullName: 'Administrador del Sistema',
        isActive: true
      },
      create: {
        username: 'admin',
        email: 'admin@gestion-scripts.local',
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        fullName: 'Administrador del Sistema',
        isActive: true
      }
    });
    console.log('  ✓ Usuario admin creado');

    // Usuario user
    const userPasswordHash = await bcrypt.hash('user123', SALT_ROUNDS);
    const normalUser = await prisma.user.upsert({
      where: { username: 'user' },
      update: {
        passwordHash: userPasswordHash,
        roleId: userRole.id,
        fullName: 'Usuario Estándar',
        isActive: true
      },
      create: {
        username: 'user',
        email: 'user@gestion-scripts.local',
        passwordHash: userPasswordHash,
        roleId: userRole.id,
        fullName: 'Usuario Estándar',
        isActive: true
      }
    });
    console.log('  ✓ Usuario user creado\n');

    // 3. Crear scripts
    console.log('📜 Creando scripts...');

    const scripts = [
      {
        name: 'Ping a Host',
        description: 'Realiza un ping a un host específico',
        body: `$computerName = "{{computerName}}"
$count = {{count}}

Write-Host "Realizando ping a $computerName..."
Test-Connection -ComputerName $computerName -Count $count | Format-Table -AutoSize
Write-Host "Ping completado."`,
        interpreter: 'powershell',
        parametersSchema: JSON.stringify({
          computerName: {
            type: 'string',
            required: true,
            description: 'Nombre o IP del equipo',
            pattern: '^[a-zA-Z0-9.-]+$'
          },
          count: {
            type: 'integer',
            required: false,
            default: 4,
            min: 1,
            max: 100,
            description: 'Número de pings'
          }
        }),
        tags: 'red, conectividad, diagnóstico',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Información del Sistema',
        description: 'Obtiene información detallada del sistema operativo',
        body: `Write-Host "=== INFORMACIÓN DEL SISTEMA ===" -ForegroundColor Cyan
Write-Host ""

$computerSystem = Get-CimInstance Win32_ComputerSystem
$operatingSystem = Get-CimInstance Win32_OperatingSystem
$processor = Get-CimInstance Win32_Processor
$bios = Get-CimInstance Win32_BIOS

Write-Host "Nombre del equipo: $($computerSystem.Name)" -ForegroundColor Green
Write-Host "Fabricante: $($computerSystem.Manufacturer)"
Write-Host "Modelo: $($computerSystem.Model)"
Write-Host ""

Write-Host "Sistema Operativo: $($operatingSystem.Caption)" -ForegroundColor Yellow
Write-Host "Versión: $($operatingSystem.Version)"
Write-Host "Arquitectura: $($operatingSystem.OSArchitecture)"
Write-Host "Instalado: $($operatingSystem.InstallDate)"
Write-Host ""

Write-Host "Procesador: $($processor.Name)" -ForegroundColor Magenta
Write-Host "Núcleos: $($processor.NumberOfCores)"
Write-Host "Procesadores lógicos: $($processor.NumberOfLogicalProcessors)"
Write-Host ""

$totalRAM = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)
$freeRAM = [math]::Round($operatingSystem.FreePhysicalMemory / 1MB, 2)
Write-Host "Memoria RAM Total: $totalRAM GB" -ForegroundColor Blue
Write-Host "Memoria RAM Libre: $freeRAM MB"
Write-Host ""

Write-Host "BIOS: $($bios.Manufacturer) - Versión $($bios.SMBIOSBIOSVersion)"`,
        interpreter: 'powershell',
        parametersSchema: null,
        tags: 'sistema, información, hardware',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Listar Procesos por Uso de CPU',
        description: 'Lista los procesos que más CPU están consumiendo',
        body: `$topCount = {{topCount}}

Write-Host "=== TOP $topCount PROCESOS POR USO DE CPU ===" -ForegroundColor Cyan
Write-Host ""

Get-Process | 
    Sort-Object CPU -Descending | 
    Select-Object -First $topCount ProcessName, CPU, WorkingSet, Id |
    Format-Table -AutoSize

Write-Host ""
Write-Host "Memoria WorkingSet en bytes" -ForegroundColor Yellow`,
        interpreter: 'powershell',
        parametersSchema: JSON.stringify({
          topCount: {
            type: 'integer',
            required: false,
            default: 10,
            min: 1,
            max: 100,
            description: 'Cantidad de procesos a mostrar'
          }
        }),
        tags: 'procesos, rendimiento, diagnóstico',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Espacio en Disco',
        description: 'Muestra el espacio disponible en todas las unidades',
        body: `Write-Host "=== ESPACIO EN DISCO ===" -ForegroundColor Cyan
Write-Host ""

Get-PSDrive -PSProvider FileSystem | 
    Where-Object { $_.Used -ne $null } |
    ForEach-Object {
        $drive = $_
        $usedGB = [math]::Round($drive.Used / 1GB, 2)
        $freeGB = [math]::Round($drive.Free / 1GB, 2)
        $totalGB = $usedGB + $freeGB
        $percentUsed = [math]::Round(($usedGB / $totalGB) * 100, 2)
        
        Write-Host "Unidad: $($drive.Name):" -ForegroundColor Green
        Write-Host "  Total: $totalGB GB"
        Write-Host "  Usado: $usedGB GB ($percentUsed%)"
        Write-Host "  Libre: $freeGB GB"
        Write-Host ""
    }`,
        interpreter: 'powershell',
        parametersSchema: null,
        tags: 'disco, almacenamiento, sistema',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Servicios de Windows',
        description: 'Lista servicios según su estado',
        body: `$estado = "{{estado}}"

Write-Host "=== SERVICIOS DE WINDOWS ($estado) ===" -ForegroundColor Cyan
Write-Host ""

if ($estado -eq "todos") {
    Get-Service | Sort-Object DisplayName | Format-Table -AutoSize Name, DisplayName, Status, StartType
} else {
    Get-Service | Where-Object { $_.Status -eq $estado } | 
        Sort-Object DisplayName | 
        Format-Table -AutoSize Name, DisplayName, Status, StartType
}

$count = (Get-Service | Where-Object { if($estado -eq "todos") { $true } else { $_.Status -eq $estado } }).Count
Write-Host ""
Write-Host "Total de servicios: $count" -ForegroundColor Yellow`,
        interpreter: 'powershell',
        parametersSchema: JSON.stringify({
          estado: {
            type: 'string',
            required: false,
            default: 'Running',
            enum: ['Running', 'Stopped', 'todos'],
            description: 'Estado de los servicios a listar'
          }
        }),
        tags: 'servicios, windows, sistema',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Test de Puerto',
        description: 'Verifica si un puerto específico está abierto en un host',
        body: `$hostName = "{{hostName}}"
$port = {{port}}

Write-Host "Probando conexión a $hostName en puerto $port..." -ForegroundColor Cyan

try {
    $result = Test-NetConnection -ComputerName $hostName -Port $port -WarningAction SilentlyContinue
    
    if ($result.TcpTestSucceeded) {
        Write-Host ""
        Write-Host "✓ Puerto $port ABIERTO" -ForegroundColor Green
        Write-Host "  Dirección remota: $($result.RemoteAddress)"
        Write-Host "  Ping exitoso: $($result.PingSucceeded)"
    } else {
        Write-Host ""
        Write-Host "✗ Puerto $port CERRADO o FILTRADO" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error al conectar: $($_.Exception.Message)" -ForegroundColor Red
}`,
        interpreter: 'powershell',
        parametersSchema: JSON.stringify({
          hostName: {
            type: 'string',
            required: true,
            description: 'Nombre o IP del host',
            pattern: '^[a-zA-Z0-9.-]+$'
          },
          port: {
            type: 'integer',
            required: true,
            description: 'Número de puerto',
            min: 1,
            max: 65535
          }
        }),
        tags: 'red, puerto, conectividad',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Limpiar Archivos Temporales',
        description: 'Limpia archivos temporales del sistema',
        body: `Write-Host "=== LIMPIEZA DE ARCHIVOS TEMPORALES ===" -ForegroundColor Cyan
Write-Host ""

$tempPaths = @(
    $env:TEMP,
    "C:\\Windows\\Temp"
)

$totalDeleted = 0
$totalSize = 0

foreach ($path in $tempPaths) {
    if (Test-Path $path) {
        Write-Host "Limpiando: $path" -ForegroundColor Yellow
        
        $files = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            try {
                $size = $file.Length
                Remove-Item $file.FullName -Force -ErrorAction Stop
                $totalDeleted++
                $totalSize += $size
            } catch {
                # Ignorar archivos en uso
            }
        }
    }
}

$sizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host ""
Write-Host "✓ Archivos eliminados: $totalDeleted" -ForegroundColor Green
Write-Host "✓ Espacio liberado: $sizeMB MB" -ForegroundColor Green`,
        interpreter: 'powershell',
        parametersSchema: null,
        tags: 'mantenimiento, limpieza, sistema',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Usuarios Locales',
        description: 'Lista todos los usuarios locales del sistema',
        body: `Write-Host "=== USUARIOS LOCALES DEL SISTEMA ===" -ForegroundColor Cyan
Write-Host ""

Get-LocalUser | 
    Sort-Object Name |
    ForEach-Object {
        $user = $_
        $color = if ($user.Enabled) { "Green" } else { "Red" }
        $status = if ($user.Enabled) { "Activo" } else { "Deshabilitado" }
        
        Write-Host "Usuario: $($user.Name)" -ForegroundColor $color
        Write-Host "  Nombre completo: $($user.FullName)"
        Write-Host "  Descripción: $($user.Description)"
        Write-Host "  Estado: $status"
        Write-Host "  Último inicio: $($user.LastLogon)"
        Write-Host "  Contraseña expira: $($user.PasswordExpires)"
        Write-Host ""
    }

$totalUsers = (Get-LocalUser).Count
$activeUsers = (Get-LocalUser | Where-Object { $_.Enabled }).Count
Write-Host "Total usuarios: $totalUsers (Activos: $activeUsers)" -ForegroundColor Yellow`,
        interpreter: 'powershell',
        parametersSchema: null,
        tags: 'usuarios, seguridad, sistema',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Eventos del Sistema',
        description: 'Muestra los últimos eventos del sistema',
        body: `$tipo = "{{tipo}}"
$cantidad = {{cantidad}}

Write-Host "=== ÚLTIMOS $cantidad EVENTOS ($tipo) ===" -ForegroundColor Cyan
Write-Host ""

$logName = switch ($tipo) {
    "Sistema" { "System" }
    "Aplicación" { "Application" }
    "Seguridad" { "Security" }
    default { "System" }
}

try {
    Get-EventLog -LogName $logName -Newest $cantidad |
        ForEach-Object {
            $color = switch ($_.EntryType) {
                "Error" { "Red" }
                "Warning" { "Yellow" }
                default { "White" }
            }
            
            Write-Host "[$($_.TimeGenerated)] $($_.EntryType)" -ForegroundColor $color
            Write-Host "  Origen: $($_.Source)"
            Write-Host "  EventID: $($_.EventID)"
            Write-Host "  Mensaje: $($_.Message.Substring(0, [Math]::Min(200, $_.Message.Length)))..."
            Write-Host ""
        }
} catch {
    Write-Host "Error al acceder al registro de eventos: $($_.Exception.Message)" -ForegroundColor Red
}`,
        interpreter: 'powershell',
        parametersSchema: JSON.stringify({
          tipo: {
            type: 'string',
            required: false,
            default: 'Sistema',
            enum: ['Sistema', 'Aplicación', 'Seguridad'],
            description: 'Tipo de eventos a mostrar'
          },
          cantidad: {
            type: 'integer',
            required: false,
            default: 10,
            min: 1,
            max: 100,
            description: 'Cantidad de eventos a mostrar'
          }
        }),
        tags: 'eventos, logs, diagnóstico',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      },
      {
        name: 'Información de Red',
        description: 'Muestra configuración de red del sistema',
        body: `Write-Host "=== CONFIGURACIÓN DE RED ===" -ForegroundColor Cyan
Write-Host ""

Get-NetIPConfiguration | ForEach-Object {
    $adapter = $_
    
    Write-Host "Adaptador: $($adapter.InterfaceAlias)" -ForegroundColor Green
    Write-Host "  Índice: $($adapter.InterfaceIndex)"
    Write-Host "  Descripción: $($adapter.InterfaceDescription)"
    
    if ($adapter.IPv4Address) {
        Write-Host "  IPv4: $($adapter.IPv4Address.IPAddress)" -ForegroundColor Yellow
        Write-Host "  Máscara: $($adapter.IPv4Address.PrefixLength) bits"
    }
    
    if ($adapter.IPv6Address) {
        Write-Host "  IPv6: $($adapter.IPv6Address.IPAddress)" -ForegroundColor Cyan
    }
    
    if ($adapter.IPv4DefaultGateway) {
        Write-Host "  Gateway: $($adapter.IPv4DefaultGateway.NextHop)"
    }
    
    if ($adapter.DNSServer) {
        Write-Host "  DNS Servers:"
        $adapter.DNSServer.ServerAddresses | ForEach-Object {
            Write-Host "    - $_"
        }
    }
    
    Write-Host ""
}`,
        interpreter: 'powershell',
        parametersSchema: null,
        tags: 'red, ip, configuración',
        isEnabled: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      }
    ];

    for (const scriptData of scripts) {
      // Verificar si el script ya existe
      const existing = await prisma.script.findFirst({
        where: { name: scriptData.name }
      });

      if (existing) {
        // Actualizar script existente
        const script = await prisma.script.update({
          where: { id: existing.id },
          data: scriptData
        });
        console.log(`  ✓ Script actualizado: ${script.name}`);
      } else {
        // Crear nuevo script
        const script = await prisma.script.create({
          data: scriptData
        });
        console.log(`  ✓ Script creado: ${script.name}`);
      }
    }

    console.log('\n✅ Base de datos inicializada correctamente\n');
    console.log('===========================================');
    console.log('   CREDENCIALES DE ACCESO');
    console.log('===========================================\n');
    console.log('👤 Administrador:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123\n');
    console.log('👤 Usuario estándar:');
    console.log('   Usuario: user');
    console.log('   Contraseña: user123\n');
    console.log('===========================================\n');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
