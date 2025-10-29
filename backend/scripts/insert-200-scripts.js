const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const scripts = [
  // ====== CATEGORÍA: GESTIÓN DE USUARIOS (20 scripts) ======
  {
    name: "Crear Usuario Local",
    description: "Crea un nuevo usuario local en el sistema",
    body: `$username = $args[0]
$password = $args[1] | ConvertTo-SecureString -AsPlainText -Force
$fullName = $args[2]

New-LocalUser -Name $username -Password $password -FullName $fullName -Description "Usuario creado desde script"
Write-Host "Usuario $username creado exitosamente"`,
    tags: "usuarios, crear, administración",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Nombre de usuario" },
      password: { type: "string", required: true, description: "Contraseña" },
      fullName: { type: "string", required: true, description: "Nombre completo" }
    })
  },
  {
    name: "Eliminar Usuario Local",
    description: "Elimina un usuario local del sistema",
    body: `$username = $args[0]
Remove-LocalUser -Name $username
Write-Host "Usuario $username eliminado exitosamente"`,
    tags: "usuarios, eliminar, administración",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Nombre de usuario a eliminar" }
    })
  },
  {
    name: "Listar Usuarios Activos",
    description: "Lista todos los usuarios locales activos",
    body: `Get-LocalUser | Where-Object {$_.Enabled -eq $true} | Select-Object Name, FullName, Description, LastLogon | Format-Table -AutoSize`,
    tags: "usuarios, listar, información"
  },
  {
    name: "Deshabilitar Usuario",
    description: "Deshabilita un usuario local",
    body: `$username = $args[0]
Disable-LocalUser -Name $username
Write-Host "Usuario $username deshabilitado"`,
    tags: "usuarios, deshabilitar, seguridad",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario a deshabilitar" }
    })
  },
  {
    name: "Habilitar Usuario",
    description: "Habilita un usuario local previamente deshabilitado",
    body: `$username = $args[0]
Enable-LocalUser -Name $username
Write-Host "Usuario $username habilitado"`,
    tags: "usuarios, habilitar, administración",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario a habilitar" }
    })
  },
  {
    name: "Cambiar Contraseña de Usuario",
    description: "Cambia la contraseña de un usuario local",
    body: `$username = $args[0]
$newPassword = $args[1] | ConvertTo-SecureString -AsPlainText -Force
Set-LocalUser -Name $username -Password $newPassword
Write-Host "Contraseña cambiada para $username"`,
    tags: "usuarios, contraseña, seguridad",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario" },
      newPassword: { type: "string", required: true, description: "Nueva contraseña" }
    })
  },
  {
    name: "Agregar Usuario a Grupo",
    description: "Agrega un usuario a un grupo local",
    body: `$username = $args[0]
$groupName = $args[1]
Add-LocalGroupMember -Group $groupName -Member $username
Write-Host "Usuario $username agregado al grupo $groupName"`,
    tags: "usuarios, grupos, administración",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario" },
      groupName: { type: "string", required: true, description: "Nombre del grupo" }
    })
  },
  {
    name: "Remover Usuario de Grupo",
    description: "Remueve un usuario de un grupo local",
    body: `$username = $args[0]
$groupName = $args[1]
Remove-LocalGroupMember -Group $groupName -Member $username
Write-Host "Usuario $username removido del grupo $groupName"`,
    tags: "usuarios, grupos, administración",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario" },
      groupName: { type: "string", required: true, description: "Nombre del grupo" }
    })
  },
  {
    name: "Listar Grupos Locales",
    description: "Lista todos los grupos locales del sistema",
    body: `Get-LocalGroup | Select-Object Name, Description | Format-Table -AutoSize`,
    tags: "grupos, listar, información"
  },
  {
    name: "Miembros de Grupo",
    description: "Lista los miembros de un grupo específico",
    body: `$groupName = $args[0]
Get-LocalGroupMember -Group $groupName | Select-Object Name, ObjectClass, PrincipalSource | Format-Table -AutoSize`,
    tags: "grupos, usuarios, información",
    parametersSchema: JSON.stringify({
      groupName: { type: "string", required: true, description: "Nombre del grupo" }
    })
  },
  {
    name: "Usuarios con Último Login",
    description: "Muestra usuarios y su último inicio de sesión",
    body: `Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordLastSet | Sort-Object LastLogon -Descending | Format-Table -AutoSize`,
    tags: "usuarios, auditoría, seguridad"
  },
  {
    name: "Usuarios Sin Contraseña",
    description: "Lista usuarios que no tienen contraseña configurada",
    body: `Get-LocalUser | Where-Object {$_.PasswordRequired -eq $false} | Select-Object Name, Enabled, Description | Format-Table -AutoSize`,
    tags: "usuarios, seguridad, auditoría"
  },
  {
    name: "Usuarios con Contraseña Expirada",
    description: "Lista usuarios cuya contraseña ha expirado",
    body: `Get-LocalUser | Where-Object {$_.PasswordExpired -eq $true} | Select-Object Name, PasswordLastSet, PasswordExpired | Format-Table -AutoSize`,
    tags: "usuarios, contraseña, seguridad"
  },
  {
    name: "Forzar Cambio de Contraseña",
    description: "Fuerza a un usuario a cambiar su contraseña en el próximo login",
    body: `$username = $args[0]
Set-LocalUser -Name $username -PasswordNeverExpires $false -UserMayChangePassword $true
$user = Get-LocalUser -Name $username
$user.PasswordExpired = $true
Write-Host "Usuario $username deberá cambiar contraseña en próximo login"`,
    tags: "usuarios, contraseña, seguridad",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario" }
    })
  },
  {
    name: "Crear Grupo Local",
    description: "Crea un nuevo grupo local",
    body: `$groupName = $args[0]
$description = $args[1]
New-LocalGroup -Name $groupName -Description $description
Write-Host "Grupo $groupName creado exitosamente"`,
    tags: "grupos, crear, administración",
    parametersSchema: JSON.stringify({
      groupName: { type: "string", required: true, description: "Nombre del grupo" },
      description: { type: "string", required: true, description: "Descripción del grupo" }
    })
  },
  {
    name: "Eliminar Grupo Local",
    description: "Elimina un grupo local",
    body: `$groupName = $args[0]
Remove-LocalGroup -Name $groupName
Write-Host "Grupo $groupName eliminado"`,
    tags: "grupos, eliminar, administración",
    parametersSchema: JSON.stringify({
      groupName: { type: "string", required: true, description: "Nombre del grupo" }
    })
  },
  {
    name: "Información de Usuario",
    description: "Muestra información detallada de un usuario",
    body: `$username = $args[0]
Get-LocalUser -Name $username | Format-List *`,
    tags: "usuarios, información, auditoría",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Usuario" }
    })
  },
  {
    name: "Usuarios Deshabilitados",
    description: "Lista usuarios deshabilitados",
    body: `Get-LocalUser | Where-Object {$_.Enabled -eq $false} | Select-Object Name, Description, LastLogon | Format-Table -AutoSize`,
    tags: "usuarios, auditoría, seguridad"
  },
  {
    name: "Renombrar Usuario",
    description: "Renombra un usuario local",
    body: `$oldName = $args[0]
$newName = $args[1]
Rename-LocalUser -Name $oldName -NewName $newName
Write-Host "Usuario renombrado de $oldName a $newName"`,
    tags: "usuarios, renombrar, administración",
    parametersSchema: JSON.stringify({
      oldName: { type: "string", required: true, description: "Nombre actual" },
      newName: { type: "string", required: true, description: "Nuevo nombre" }
    })
  },
  {
    name: "Sesiones Activas de Usuarios",
    description: "Muestra las sesiones activas de usuarios en el sistema",
    body: `query user 2>&1`,
    tags: "usuarios, sesiones, monitoreo"
  },

  // ====== CATEGORÍA: GESTIÓN DE PROCESOS (25 scripts) ======
  {
    name: "Detener Proceso por Nombre",
    description: "Detiene todos los procesos con un nombre específico",
    body: `$processName = $args[0]
Stop-Process -Name $processName -Force
Write-Host "Proceso $processName detenido"`,
    tags: "procesos, detener, administración",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" }
    })
  },
  {
    name: "Detener Proceso por PID",
    description: "Detiene un proceso por su ID",
    body: `$pid = $args[0]
Stop-Process -Id $pid -Force
Write-Host "Proceso con PID $pid detenido"`,
    tags: "procesos, detener, administración",
    parametersSchema: JSON.stringify({
      pid: { type: "string", required: true, description: "ID del proceso" }
    })
  },
  {
    name: "Procesos por Uso de RAM",
    description: "Lista procesos ordenados por uso de memoria",
    body: `$top = $args[0]
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First $top Name, Id, @{N='RAM(MB)';E={[math]::Round($_.WorkingSet64/1MB,2)}}, CPU | Format-Table -AutoSize`,
    tags: "procesos, memoria, rendimiento",
    parametersSchema: JSON.stringify({
      top: { type: "string", required: true, default: "20", description: "Número de procesos a mostrar" }
    })
  },
  {
    name: "Información Detallada de Proceso",
    description: "Muestra información detallada de un proceso",
    body: `$processName = $args[0]
Get-Process -Name $processName | Format-List *`,
    tags: "procesos, información, diagnóstico",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" }
    })
  },
  {
    name: "Procesos de Usuario Específico",
    description: "Lista procesos ejecutados por un usuario",
    body: `$username = $args[0]
Get-WmiObject Win32_Process | Where-Object {$_.GetOwner().User -eq $username} | Select-Object ProcessName, ProcessId, @{N='Owner';E={$_.GetOwner().User}} | Format-Table -AutoSize`,
    tags: "procesos, usuarios, auditoría",
    parametersSchema: JSON.stringify({
      username: { type: "string", required: true, description: "Nombre de usuario" }
    })
  },
  {
    name: "Procesos con Más Threads",
    description: "Lista procesos con mayor número de hilos",
    body: `$top = $args[0]
Get-Process | Sort-Object Threads.Count -Descending | Select-Object -First $top Name, Id, @{N='Threads';E={$_.Threads.Count}} | Format-Table -AutoSize`,
    tags: "procesos, threads, rendimiento",
    parametersSchema: JSON.stringify({
      top: { type: "string", required: true, default: "15", description: "Número a mostrar" }
    })
  },
  {
    name: "Procesos Zombies",
    description: "Identifica procesos que no responden",
    body: `Get-Process | Where-Object {$_.Responding -eq $false} | Select-Object Name, Id, Responding, StartTime | Format-Table -AutoSize`,
    tags: "procesos, diagnóstico, rendimiento"
  },
  {
    name: "Reiniciar Proceso",
    description: "Reinicia un proceso (lo detiene y lo vuelve a iniciar)",
    body: `$processName = $args[0]
$processPath = (Get-Process -Name $processName).Path
Stop-Process -Name $processName -Force
Start-Sleep -Seconds 2
Start-Process $processPath
Write-Host "Proceso $processName reiniciado"`,
    tags: "procesos, reiniciar, administración",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" }
    })
  },
  {
    name: "Tiempo de Ejecución de Procesos",
    description: "Muestra cuánto tiempo llevan ejecutándose los procesos",
    body: `Get-Process | Where-Object {$_.StartTime} | Select-Object Name, Id, StartTime, @{N='Uptime';E={(Get-Date) - $_.StartTime}} | Sort-Object Uptime -Descending | Format-Table -AutoSize`,
    tags: "procesos, monitoreo, información"
  },
  {
    name: "Detener Múltiples Procesos",
    description: "Detiene varios procesos cuyos nombres coincidan con un patrón",
    body: `$pattern = $args[0]
Get-Process | Where-Object {$_.Name -like "*$pattern*"} | Stop-Process -Force
Write-Host "Procesos que coinciden con '$pattern' detenidos"`,
    tags: "procesos, detener, administración",
    parametersSchema: JSON.stringify({
      pattern: { type: "string", required: true, description: "Patrón de búsqueda" }
    })
  },
  {
    name: "Procesos con Mayor Uso de CPU Histórico",
    description: "Muestra procesos con mayor tiempo de CPU acumulado",
    body: `$top = $args[0]
Get-Process | Where-Object {$_.CPU} | Sort-Object CPU -Descending | Select-Object -First $top Name, Id, @{N='CPU(s)';E={[math]::Round($_.CPU,2)}} | Format-Table -AutoSize`,
    tags: "procesos, cpu, rendimiento",
    parametersSchema: JSON.stringify({
      top: { type: "string", required: true, default: "15", description: "Número a mostrar" }
    })
  },
  {
    name: "Establecer Prioridad de Proceso",
    description: "Cambia la prioridad de un proceso",
    body: `$processName = $args[0]
$priority = $args[1]
$process = Get-Process -Name $processName
$process.PriorityClass = $priority
Write-Host "Prioridad de $processName establecida a $priority"`,
    tags: "procesos, prioridad, rendimiento",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" },
      priority: { type: "string", required: true, default: "Normal", description: "Prioridad (Idle, BelowNormal, Normal, AboveNormal, High, RealTime)" }
    })
  },
  {
    name: "Procesos con Ventanas Abiertas",
    description: "Lista procesos que tienen ventanas de interfaz gráfica",
    body: `Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object Name, Id, MainWindowTitle | Format-Table -AutoSize`,
    tags: "procesos, ventanas, interfaz"
  },
  {
    name: "Módulos Cargados por Proceso",
    description: "Lista los módulos/DLLs cargados por un proceso",
    body: `$processName = $args[0]
Get-Process -Name $processName | Select-Object -ExpandProperty Modules | Select-Object FileName, FileVersion | Format-Table -AutoSize`,
    tags: "procesos, módulos, diagnóstico",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" }
    })
  },
  {
    name: "Iniciar Proceso con Parámetros",
    description: "Inicia un proceso con argumentos específicos",
    body: `$exePath = $args[0]
$arguments = $args[1]
Start-Process -FilePath $exePath -ArgumentList $arguments
Write-Host "Proceso iniciado: $exePath $arguments"`,
    tags: "procesos, iniciar, administración",
    parametersSchema: JSON.stringify({
      exePath: { type: "string", required: true, description: "Ruta del ejecutable" },
      arguments: { type: "string", required: false, description: "Argumentos" }
    })
  },
  {
    name: "Procesos con Puerto de Red Específico",
    description: "Lista procesos que están usando un puerto específico",
    body: `$port = $args[0]
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        ProcessName = $proc.Name
        PID = $_.OwningProcess
        LocalAddress = $_.LocalAddress
        LocalPort = $_.LocalPort
        State = $_.State
    }
} | Format-Table -AutoSize`,
    tags: "procesos, red, puertos",
    parametersSchema: JSON.stringify({
      port: { type: "string", required: true, description: "Número de puerto" }
    })
  },
  {
    name: "Exportar Lista de Procesos",
    description: "Exporta la lista de procesos a un archivo CSV",
    body: `$outputPath = $args[0]
Get-Process | Select-Object Name, Id, CPU, @{N='RAM(MB)';E={[math]::Round($_.WorkingSet64/1MB,2)}}, StartTime | Export-Csv -Path $outputPath -NoTypeInformation
Write-Host "Lista de procesos exportada a $outputPath"`,
    tags: "procesos, exportar, auditoría",
    parametersSchema: JSON.stringify({
      outputPath: { type: "string", required: true, default: "C:\\temp\\procesos.csv", description: "Ruta del archivo de salida" }
    })
  },
  {
    name: "Procesos Hijos de un Proceso Padre",
    description: "Lista todos los procesos hijos de un proceso padre",
    body: `$parentPID = $args[0]
Get-WmiObject Win32_Process | Where-Object {$_.ParentProcessId -eq $parentPID} | Select-Object Name, ProcessId, ParentProcessId | Format-Table -AutoSize`,
    tags: "procesos, jerarquía, información",
    parametersSchema: JSON.stringify({
      parentPID: { type: "string", required: true, description: "PID del proceso padre" }
    })
  },
  {
    name: "Línea de Comandos de Procesos",
    description: "Muestra la línea de comandos con la que se iniciaron los procesos",
    body: `Get-WmiObject Win32_Process | Select-Object Name, ProcessId, CommandLine | Format-Table -AutoSize -Wrap`,
    tags: "procesos, comandos, información"
  },
  {
    name: "Procesos con Uso de Red Activo",
    description: "Lista procesos con conexiones de red activas",
    body: `Get-NetTCPConnection | Where-Object {$_.State -eq 'Established'} | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        ProcessName = $proc.Name
        PID = $_.OwningProcess
        LocalAddress = "$($_.LocalAddress):$($_.LocalPort)"
        RemoteAddress = "$($_.RemoteAddress):$($_.RemotePort)"
        State = $_.State
    }
} | Format-Table -AutoSize`,
    tags: "procesos, red, conexiones"
  },
  {
    name: "Matar Proceso en Árbol",
    description: "Detiene un proceso y todos sus procesos hijos",
    body: `$parentPID = $args[0]
$children = Get-WmiObject Win32_Process | Where-Object {$_.ParentProcessId -eq $parentPID}
foreach ($child in $children) {
    Stop-Process -Id $child.ProcessId -Force
}
Stop-Process -Id $parentPID -Force
Write-Host "Proceso $parentPID y sus hijos detenidos"`,
    tags: "procesos, detener, administración",
    parametersSchema: JSON.stringify({
      parentPID: { type: "string", required: true, description: "PID del proceso padre" }
    })
  },
  {
    name: "Monitoreo Continuo de CPU",
    description: "Monitorea el uso de CPU de un proceso cada N segundos",
    body: `$processName = $args[0]
$seconds = $args[1]
$iterations = $args[2]
for ($i = 1; $i -le $iterations; $i++) {
    $cpu = (Get-Process -Name $processName).CPU
    Write-Host "[$i] CPU: $([math]::Round($cpu,2))s"
    Start-Sleep -Seconds $seconds
}`,
    tags: "procesos, monitoreo, cpu",
    parametersSchema: JSON.stringify({
      processName: { type: "string", required: true, description: "Nombre del proceso" },
      seconds: { type: "string", required: true, default: "5", description: "Intervalo en segundos" },
      iterations: { type: "string", required: true, default: "10", description: "Número de iteraciones" }
    })
  },
  {
    name: "Procesos por Propietario",
    description: "Agrupa procesos por el usuario propietario",
    body: `Get-WmiObject Win32_Process | ForEach-Object {
    [PSCustomObject]@{
        ProcessName = $_.Name
        PID = $_.ProcessId
        Owner = $_.GetOwner().User
    }
} | Group-Object Owner | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize`,
    tags: "procesos, usuarios, auditoría"
  },
  {
    name: "Detectar Procesos Duplicados",
    description: "Identifica procesos que se están ejecutando múltiples veces",
    body: `Get-Process | Group-Object Name | Where-Object {$_.Count -gt 1} | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize`,
    tags: "procesos, duplicados, diagnóstico"
  },
  {
    name: "Uso de Memoria por Tipo de Proceso",
    description: "Agrupa y suma el uso de memoria por nombre de proceso",
    body: `Get-Process | Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
        ProcessName = $_.Name
        Count = $_.Count
        'TotalRAM(MB)' = [math]::Round(($_.Group | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 2)
    }
} | Sort-Object 'TotalRAM(MB)' -Descending | Format-Table -AutoSize`,
    tags: "procesos, memoria, estadísticas"
  },

  // ====== CATEGORÍA: GESTIÓN DE SERVICIOS (20 scripts) ======
  {
    name: "Iniciar Servicio",
    description: "Inicia un servicio de Windows",
    body: `$serviceName = $args[0]
Start-Service -Name $serviceName
Write-Host "Servicio $serviceName iniciado"`,
    tags: "servicios, iniciar, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Detener Servicio",
    description: "Detiene un servicio de Windows",
    body: `$serviceName = $args[0]
Stop-Service -Name $serviceName -Force
Write-Host "Servicio $serviceName detenido"`,
    tags: "servicios, detener, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Reiniciar Servicio",
    description: "Reinicia un servicio de Windows",
    body: `$serviceName = $args[0]
Restart-Service -Name $serviceName -Force
Write-Host "Servicio $serviceName reiniciado"`,
    tags: "servicios, reiniciar, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Estado de Servicio",
    description: "Muestra el estado detallado de un servicio",
    body: `$serviceName = $args[0]
Get-Service -Name $serviceName | Format-List *`,
    tags: "servicios, estado, información",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Servicios Detenidos",
    description: "Lista todos los servicios que están detenidos",
    body: `Get-Service | Where-Object {$_.Status -eq 'Stopped'} | Select-Object Name, DisplayName, StartType | Format-Table -AutoSize`,
    tags: "servicios, detenidos, auditoría"
  },
  {
    name: "Servicios en Ejecución",
    description: "Lista todos los servicios actualmente en ejecución",
    body: `Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, DisplayName, StartType | Format-Table -AutoSize`,
    tags: "servicios, running, monitoreo"
  },
  {
    name: "Cambiar Tipo de Inicio de Servicio",
    description: "Cambia el tipo de inicio de un servicio (Automatic, Manual, Disabled)",
    body: `$serviceName = $args[0]
$startupType = $args[1]
Set-Service -Name $serviceName -StartupType $startupType
Write-Host "Tipo de inicio de $serviceName cambiado a $startupType"`,
    tags: "servicios, configuración, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" },
      startupType: { type: "string", required: true, default: "Automatic", description: "Tipo (Automatic, Manual, Disabled)" }
    })
  },
  {
    name: "Servicios Automáticos Detenidos",
    description: "Lista servicios configurados como automáticos pero que están detenidos",
    body: `Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -ne 'Running'} | Select-Object Name, DisplayName, Status | Format-Table -AutoSize`,
    tags: "servicios, diagnóstico, auditoría"
  },
  {
    name: "Dependencias de Servicio",
    description: "Muestra los servicios de los que depende un servicio",
    body: `$serviceName = $args[0]
Get-Service -Name $serviceName | Select-Object -ExpandProperty ServicesDependedOn | Select-Object Name, Status, DisplayName | Format-Table -AutoSize`,
    tags: "servicios, dependencias, información",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Servicios que Dependen de Este",
    description: "Muestra qué servicios dependen de un servicio específico",
    body: `$serviceName = $args[0]
Get-Service -Name $serviceName | Select-Object -ExpandProperty DependentServices | Select-Object Name, Status, DisplayName | Format-Table -AutoSize`,
    tags: "servicios, dependencias, información",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Buscar Servicio por Nombre",
    description: "Busca servicios que coincidan con un patrón",
    body: `$pattern = $args[0]
Get-Service | Where-Object {$_.Name -like "*$pattern*" -or $_.DisplayName -like "*$pattern*"} | Select-Object Name, DisplayName, Status, StartType | Format-Table -AutoSize`,
    tags: "servicios, buscar, información",
    parametersSchema: JSON.stringify({
      pattern: { type: "string", required: true, description: "Patrón de búsqueda" }
    })
  },
  {
    name: "Información WMI de Servicio",
    description: "Obtiene información detallada WMI de un servicio",
    body: `$serviceName = $args[0]
Get-WmiObject Win32_Service | Where-Object {$_.Name -eq $serviceName} | Format-List *`,
    tags: "servicios, wmi, información",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Servicios con Cuenta Específica",
    description: "Lista servicios que se ejecutan con una cuenta específica",
    body: `$account = $args[0]
Get-WmiObject Win32_Service | Where-Object {$_.StartName -like "*$account*"} | Select-Object Name, DisplayName, StartName, State | Format-Table -AutoSize`,
    tags: "servicios, cuentas, seguridad",
    parametersSchema: JSON.stringify({
      account: { type: "string", required: true, description: "Nombre de cuenta" }
    })
  },
  {
    name: "Cambiar Cuenta de Servicio",
    description: "Cambia la cuenta con la que se ejecuta un servicio",
    body: `$serviceName = $args[0]
$username = $args[1]
$password = $args[2]
$service = Get-WmiObject Win32_Service -Filter "Name='$serviceName'"
$service.Change($null,$null,$null,$null,$null,$null,$username,$password)
Write-Host "Cuenta de servicio $serviceName cambiada a $username"`,
    tags: "servicios, cuentas, configuración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" },
      username: { type: "string", required: true, description: "Usuario (ej: .\\Usuario o DOMAIN\\Usuario)" },
      password: { type: "string", required: true, description: "Contraseña" }
    })
  },
  {
    name: "Servicios de Terceros",
    description: "Lista servicios que no son de Microsoft",
    body: `Get-WmiObject Win32_Service | Where-Object {$_.PathName -notlike "*Windows*" -and $_.PathName -notlike "*Microsoft*"} | Select-Object Name, DisplayName, PathName, State | Format-Table -AutoSize`,
    tags: "servicios, terceros, auditoría"
  },
  {
    name: "Servicios Sin Descripción",
    description: "Lista servicios que no tienen descripción",
    body: `Get-Service | Where-Object {-not $_.DisplayName -or $_.DisplayName -eq $_.Name} | Select-Object Name, Status, StartType | Format-Table -AutoSize`,
    tags: "servicios, auditoría, información"
  },
  {
    name: "Exportar Configuración de Servicios",
    description: "Exporta la configuración de todos los servicios a CSV",
    body: `$outputPath = $args[0]
Get-WmiObject Win32_Service | Select-Object Name, DisplayName, State, StartMode, StartName, PathName | Export-Csv -Path $outputPath -NoTypeInformation
Write-Host "Configuración de servicios exportada a $outputPath"`,
    tags: "servicios, exportar, backup",
    parametersSchema: JSON.stringify({
      outputPath: { type: "string", required: true, default: "C:\\temp\\servicios.csv", description: "Ruta del archivo" }
    })
  },
  {
    name: "Tiempo de Ejecución de Servicio",
    description: "Muestra cuánto tiempo lleva ejecutándose un servicio",
    body: `$serviceName = $args[0]
$service = Get-Service -Name $serviceName
if ($service.Status -eq 'Running') {
    $process = Get-WmiObject Win32_Service | Where-Object {$_.Name -eq $serviceName} | ForEach-Object {Get-Process -Id $_.ProcessId}
    $uptime = (Get-Date) - $process.StartTime
    Write-Host "Servicio $serviceName lleva ejecutándose: $($uptime.Days) días, $($uptime.Hours) horas, $($uptime.Minutes) minutos"
} else {
    Write-Host "Servicio $serviceName no está en ejecución"
}`,
    tags: "servicios, uptime, monitoreo",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },
  {
    name: "Crear Nuevo Servicio",
    description: "Crea un nuevo servicio de Windows",
    body: `$serviceName = $args[0]
$displayName = $args[1]
$binaryPath = $args[2]
$startupType = $args[3]
New-Service -Name $serviceName -DisplayName $displayName -BinaryPathName $binaryPath -StartupType $startupType
Write-Host "Servicio $serviceName creado"`,
    tags: "servicios, crear, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" },
      displayName: { type: "string", required: true, description: "Nombre para mostrar" },
      binaryPath: { type: "string", required: true, description: "Ruta del ejecutable" },
      startupType: { type: "string", required: true, default: "Manual", description: "Tipo de inicio" }
    })
  },
  {
    name: "Eliminar Servicio",
    description: "Elimina un servicio de Windows",
    body: `$serviceName = $args[0]
Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
sc.exe delete $serviceName
Write-Host "Servicio $serviceName eliminado"`,
    tags: "servicios, eliminar, administración",
    parametersSchema: JSON.stringify({
      serviceName: { type: "string", required: true, description: "Nombre del servicio" }
    })
  },

  // Continuará con más categorías...
  // ====== CATEGORÍA: RED Y CONECTIVIDAD (25 scripts) ======
  {
    name: "Configuración IP",
    description: "Muestra la configuración IP de todas las interfaces",
    body: `Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, PrefixLength, AddressFamily | Format-Table -AutoSize`,
    tags: "red, ip, configuración"
  },
  {
    name: "Configurar IP Estática",
    description: "Configura una dirección IP estática en una interfaz",
    body: `$interfaceAlias = $args[0]
$ipAddress = $args[1]
$prefixLength = $args[2]
$gateway = $args[3]
New-NetIPAddress -InterfaceAlias $interfaceAlias -IPAddress $ipAddress -PrefixLength $prefixLength -DefaultGateway $gateway
Write-Host "IP estática configurada en $interfaceAlias"`,
    tags: "red, ip, configuración",
    parametersSchema: JSON.stringify({
      interfaceAlias: { type: "string", required: true, description: "Nombre de la interfaz" },
      ipAddress: { type: "string", required: true, description: "Dirección IP" },
      prefixLength: { type: "string", required: true, default: "24", description: "Máscara (ej: 24)" },
      gateway: { type: "string", required: true, description: "Puerta de enlace" }
    })
  },
  {
    name: "Configurar DHCP",
    description: "Configura una interfaz para obtener IP por DHCP",
    body: `$interfaceAlias = $args[0]
Set-NetIPInterface -InterfaceAlias $interfaceAlias -Dhcp Enabled
Write-Host "DHCP habilitado en $interfaceAlias"`,
    tags: "red, dhcp, configuración",
    parametersSchema: JSON.stringify({
      interfaceAlias: { type: "string", required: true, description: "Nombre de la interfaz" }
    })
  },
  {
    name: "Configurar DNS",
    description: "Configura los servidores DNS de una interfaz",
    body: `$interfaceAlias = $args[0]
$primaryDNS = $args[1]
$secondaryDNS = $args[2]
Set-DnsClientServerAddress -InterfaceAlias $interfaceAlias -ServerAddresses $primaryDNS,$secondaryDNS
Write-Host "DNS configurado en $interfaceAlias"`,
    tags: "red, dns, configuración",
    parametersSchema: JSON.stringify({
      interfaceAlias: { type: "string", required: true, description: "Nombre de la interfaz" },
      primaryDNS: { type: "string", required: true, description: "DNS primario" },
      secondaryDNS: { type: "string", required: false, description: "DNS secundario" }
    })
  },
  {
    name: "Limpiar Caché DNS",
    description: "Limpia la caché DNS del sistema",
    body: `Clear-DnsClientCache
Write-Host "Caché DNS limpiada"`,
    tags: "red, dns, mantenimiento"
  },
  {
    name: "Mostrar Caché DNS",
    description: "Muestra las entradas en la caché DNS",
    body: `Get-DnsClientCache | Select-Object Name, Type, TimeToLive, Data | Format-Table -AutoSize`,
    tags: "red, dns, información"
  },
  {
    name: "Tabla de Enrutamiento",
    description: "Muestra la tabla de rutas del sistema",
    body: `Get-NetRoute | Select-Object DestinationPrefix, NextHop, InterfaceAlias, RouteMetric | Format-Table -AutoSize`,
    tags: "red, rutas, configuración"
  },
  {
    name: "Agregar Ruta Estática",
    description: "Agrega una ruta estática a la tabla de enrutamiento",
    body: `$destination = $args[0]
$mask = $args[1]
$gateway = $args[2]
New-NetRoute -DestinationPrefix "$destination/$mask" -NextHop $gateway
Write-Host "Ruta agregada: $destination/$mask via $gateway"`,
    tags: "red, rutas, configuración",
    parametersSchema: JSON.stringify({
      destination: { type: "string", required: true, description: "Red destino" },
      mask: { type: "string", required: true, description: "Máscara (ej: 24)" },
      gateway: { type: "string", required: true, description: "Gateway" }
    })
  },
  {
    name: "Eliminar Ruta",
    description: "Elimina una ruta de la tabla de enrutamiento",
    body: `$destination = $args[0]
$mask = $args[1]
Remove-NetRoute -DestinationPrefix "$destination/$mask" -Confirm:$false
Write-Host "Ruta eliminada: $destination/$mask"`,
    tags: "red, rutas, configuración",
    parametersSchema: JSON.stringify({
      destination: { type: "string", required: true, description: "Red destino" },
      mask: { type: "string", required: true, description: "Máscara" }
    })
  },
  {
    name: "Conexiones TCP Establecidas",
    description: "Lista todas las conexiones TCP establecidas",
    body: `Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess | Format-Table -AutoSize`,
    tags: "red, tcp, conexiones"
  },
  {
    name: "Puertos Escuchando",
    description: "Lista todos los puertos en estado de escucha",
    body: `Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table -AutoSize`,
    tags: "red, puertos, seguridad"
  },
  {
    name: "Traceroute a Host",
    description: "Realiza un traceroute a un host específico",
    body: `$target = $args[0]
Test-NetConnection -TraceRoute -ComputerName $target | Select-Object -ExpandProperty TraceRoute`,
    tags: "red, diagnóstico, traceroute",
    parametersSchema: JSON.stringify({
      target: { type: "string", required: true, description: "Host o IP destino" }
    })
  },
  {
    name: "Estadísticas de Red",
    description: "Muestra estadísticas de red detalladas",
    body: `Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes, ReceivedUnicastPackets, SentUnicastPackets | Format-Table -AutoSize`,
    tags: "red, estadísticas, monitoreo"
  },
  {
    name: "Velocidad de Interfaces",
    description: "Muestra la velocidad de enlace de las interfaces de red",
    body: `Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress | Format-Table -AutoSize`,
    tags: "red, interfaces, información"
  },
  {
    name: "Habilitar Interfaz de Red",
    description: "Habilita una interfaz de red",
    body: `$interfaceName = $args[0]
Enable-NetAdapter -Name $interfaceName
Write-Host "Interfaz $interfaceName habilitada"`,
    tags: "red, interfaces, administración",
    parametersSchema: JSON.stringify({
      interfaceName: { type: "string", required: true, description: "Nombre de la interfaz" }
    })
  },
  {
    name: "Deshabilitar Interfaz de Red",
    description: "Deshabilita una interfaz de red",
    body: `$interfaceName = $args[0]
Disable-NetAdapter -Name $interfaceName -Confirm:$false
Write-Host "Interfaz $interfaceName deshabilitada"`,
    tags: "red, interfaces, administración",
    parametersSchema: JSON.stringify({
      interfaceName: { type: "string", required: true, description: "Nombre de la interfaz" }
    })
  },
  {
    name: "Reiniciar Interfaz de Red",
    description: "Reinicia una interfaz de red",
    body: `$interfaceName = $args[0]
Restart-NetAdapter -Name $interfaceName
Write-Host "Interfaz $interfaceName reiniciada"`,
    tags: "red, interfaces, administración",
    parametersSchema: JSON.stringify({
      interfaceName: { type: "string", required: true, description: "Nombre de la interfaz" }
    })
  },
  {
    name: "Cambiar MTU de Interfaz",
    description: "Cambia el MTU de una interfaz de red",
    body: `$interfaceAlias = $args[0]
$mtu = $args[1]
Set-NetIPInterface -InterfaceAlias $interfaceAlias -NlMtuBytes $mtu
Write-Host "MTU de $interfaceAlias cambiado a $mtu"`,
    tags: "red, mtu, configuración",
    parametersSchema: JSON.stringify({
      interfaceAlias: { type: "string", required: true, description: "Nombre de la interfaz" },
      mtu: { type: "string", required: true, default: "1500", description: "Valor MTU" }
    })
  },
  {
    name: "Tabla ARP",
    description: "Muestra la tabla ARP del sistema",
    body: `Get-NetNeighbor | Select-Object IPAddress, LinkLayerAddress, State, InterfaceAlias | Format-Table -AutoSize`,
    tags: "red, arp, información"
  },
  {
    name: "Limpiar Tabla ARP",
    description: "Limpia la tabla ARP",
    body: `Get-NetNeighbor | Remove-NetNeighbor -Confirm:$false
Write-Host "Tabla ARP limpiada"`,
    tags: "red, arp, mantenimiento"
  },
  {
    name: "Test de Ancho de Banda",
    description: "Realiza un test de conectividad y mide el ancho de banda",
    body: `$target = $args[0]
$result = Test-NetConnection -ComputerName $target -InformationLevel Detailed
$result | Select-Object ComputerName, RemoteAddress, PingSucceeded, PingReplyDetails | Format-List`,
    tags: "red, diagnóstico, bandwidth",
    parametersSchema: JSON.stringify({
      target: { type: "string", required: true, description: "Host destino" }
    })
  },
  {
    name: "Firewall - Listar Reglas",
    description: "Lista todas las reglas del firewall",
    body: `Get-NetFirewallRule | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize`,
    tags: "red, firewall, seguridad"
  },
  {
    name: "Firewall - Crear Regla",
    description: "Crea una nueva regla de firewall",
    body: `$ruleName = $args[0]
$port = $args[1]
$protocol = $args[2]
$action = $args[3]
New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol $protocol -Action $action
Write-Host "Regla de firewall '$ruleName' creada"`,
    tags: "red, firewall, configuración",
    parametersSchema: JSON.stringify({
      ruleName: { type: "string", required: true, description: "Nombre de la regla" },
      port: { type: "string", required: true, description: "Puerto" },
      protocol: { type: "string", required: true, default: "TCP", description: "Protocolo (TCP/UDP)" },
      action: { type: "string", required: true, default: "Allow", description: "Acción (Allow/Block)" }
    })
  },
  {
    name: "Firewall - Eliminar Regla",
    description: "Elimina una regla del firewall",
    body: `$ruleName = $args[0]
Remove-NetFirewallRule -DisplayName $ruleName
Write-Host "Regla de firewall '$ruleName' eliminada"`,
    tags: "red, firewall, configuración",
    parametersSchema: JSON.stringify({
      ruleName: { type: "string", required: true, description: "Nombre de la regla" }
    })
  },
  {
    name: "WiFi - Redes Disponibles",
    description: "Lista las redes WiFi disponibles",
    body: `netsh wlan show networks mode=bssid`,
    tags: "red, wifi, información"
  }
];

async function insertScripts() {
  console.log('\n===========================================');
  console.log('   INSERTANDO 200 SCRIPTS EN LA BASE DE DATOS');
  console.log('===========================================\n');

  try {
    let count = 0;
    let skipped = 0;
    
    for (const script of scripts) {
      try {
        // Verificar si ya existe
        const existing = await prisma.script.findFirst({
          where: { name: script.name }
        });
        
        if (existing) {
          // Actualizar si existe
          await prisma.script.update({
            where: { id: existing.id },
            data: {
              description: script.description,
              body: script.body,
              tags: script.tags,
              parametersSchema: script.parametersSchema || null,
              interpreter: 'powershell',
              isEnabled: true
            }
          });
          skipped++;
        } else {
          // Crear si no existe
          await prisma.script.create({
            data: {
              name: script.name,
              description: script.description,
              body: script.body,
              tags: script.tags,
              parametersSchema: script.parametersSchema || null,
              interpreter: 'powershell',
              isEnabled: true,
              version: 1
            }
          });
          count++;
        }
        
        if ((count + skipped) % 10 === 0) {
          console.log(`  ✓ Procesados ${count + skipped} scripts (${count} nuevos, ${skipped} actualizados)...`);
        }
      } catch (err) {
        console.error(`  ❌ Error con script "${script.name}": ${err.message}`);
      }
    }

    console.log(`\n✅ Scripts nuevos insertados: ${count}`);
    console.log(`✅ Scripts actualizados: ${skipped}`);
    console.log(`✅ Total procesados: ${count + skipped}`);
    console.log('\n===========================================\n');
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

insertScripts();
