-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2025 a las 17:44:11
-- Versión del servidor: 10.4.16-MariaDB
-- Versión de PHP: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_scripts`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_trail`
--

CREATE TABLE `audit_trail` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `entity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` int(10) UNSIGNED DEFAULT NULL,
  `performed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `audit_trail`
--

INSERT INTO `audit_trail` (`id`, `entity`, `entity_id`, `action`, `performed_by`, `performed_at`, `details`) VALUES
(1, 'execution', 11, 'EXECUTE', 1, '2025-10-29 16:25:58', '{\"scriptId\":2,\"scriptName\":\"Información del Sistema\",\"success\":true,\"exitCode\":0}'),
(2, 'execution', 11, 'UPDATE_COMMENTS', 1, '2025-10-29 16:26:14', '{\"scriptId\":2,\"scriptName\":\"Información del Sistema\",\"comentariosLength\":31}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `execution_logs`
--

CREATE TABLE `execution_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `script_id` int(10) UNSIGNED NOT NULL,
  `executed_by` int(10) UNSIGNED DEFAULT NULL,
  `host_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `host_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT current_timestamp(),
  `finished_at` datetime DEFAULT NULL,
  `duration_seconds` decimal(10,3) DEFAULT NULL,
  `exit_code` int(11) DEFAULT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `stdout` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stderr` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `execution_context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`execution_context`)),
  `comments` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `execution_logs`
--

INSERT INTO `execution_logs` (`id`, `script_id`, `executed_by`, `host_name`, `host_ip`, `started_at`, `finished_at`, `duration_seconds`, `exit_code`, `success`, `stdout`, `stderr`, `execution_context`, `comments`) VALUES
(11, 2, 1, 'DESKTOP-PL1KO29', '172.25.96.1', '2025-10-29 16:25:55', '2025-10-29 16:25:58', '2.058', 0, 1, '=== INFORMACIÓN DEL SISTEMA ===\n\nNombre del equipo: DESKTOP-PL1KO29\nFabricante: Micro-Star International Co., Ltd.\nModelo: GF75 Thin 9SC\n\nSistema Operativo: Microsoft Windows 11 Education\nVersión: 10.0.26200\nArquitectura: 64 bits\nInstalado: 12/13/2024 03:04:37\n\nProcesador: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz\nNúcleos: 6\nProcesadores lógicos: 12\n\nMemoria RAM Total: 31.85 GB\nMemoria RAM Libre: 8.78 MB\n\nBIOS: American Megatrends Inc. - Versión E17F2IMS.106\n\n\n===============================================\n  INFORMACION DE EJECUCION\n===============================================\nFecha de finalizacion: 29/10/2025 17:25:58\nExit Code: 0\nEstado: Exitoso\nDuracion: 2.058s\n===============================================\n', NULL, '{\"parameters\":{},\"scriptVersion\":1,\"interpreter\":\"powershell\"}', 'El script se realizó bien.\nFran');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrador con permisos completos (crear/editar/borrar scripts, gestión de usuarios)'),
(2, 'user', 'Usuario estándar: solo puede ver y ejecutar scripts');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `scripts`
--

CREATE TABLE `scripts` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `interpreter` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'powershell',
  `entry_point` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parameters_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters_schema`)),
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `last_executed_at` datetime DEFAULT NULL,
  `execution_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `scripts`
--

INSERT INTO `scripts` (`id`, `name`, `description`, `body`, `interpreter`, `entry_point`, `parameters_schema`, `tags`, `is_enabled`, `created_by`, `updated_by`, `created_at`, `updated_at`, `version`, `last_executed_at`, `execution_count`) VALUES
(1, 'Ping a Host', 'Realiza un ping a un host específico', '$computerName = \"{{computerName}}\"\n$count = {{count}}\n\nWrite-Host \"Realizando ping a $computerName...\"\nTest-Connection -ComputerName $computerName -Count $count | Format-Table -AutoSize\nWrite-Host \"Ping completado.\"', 'powershell', NULL, '{\"computerName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre o IP del equipo\",\"pattern\":\"^[a-zA-Z0-9.-]+$\"},\"count\":{\"type\":\"integer\",\"required\":false,\"default\":4,\"min\":1,\"max\":100,\"description\":\"Número de pings\"}}', 'red, conectividad, diagnóstico', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(2, 'Información del Sistema', 'Obtiene información detallada del sistema operativo', 'Write-Host \"=== INFORMACIÓN DEL SISTEMA ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\n$computerSystem = Get-CimInstance Win32_ComputerSystem\n$operatingSystem = Get-CimInstance Win32_OperatingSystem\n$processor = Get-CimInstance Win32_Processor\n$bios = Get-CimInstance Win32_BIOS\n\nWrite-Host \"Nombre del equipo: $($computerSystem.Name)\" -ForegroundColor Green\nWrite-Host \"Fabricante: $($computerSystem.Manufacturer)\"\nWrite-Host \"Modelo: $($computerSystem.Model)\"\nWrite-Host \"\"\n\nWrite-Host \"Sistema Operativo: $($operatingSystem.Caption)\" -ForegroundColor Yellow\nWrite-Host \"Versión: $($operatingSystem.Version)\"\nWrite-Host \"Arquitectura: $($operatingSystem.OSArchitecture)\"\nWrite-Host \"Instalado: $($operatingSystem.InstallDate)\"\nWrite-Host \"\"\n\nWrite-Host \"Procesador: $($processor.Name)\" -ForegroundColor Magenta\nWrite-Host \"Núcleos: $($processor.NumberOfCores)\"\nWrite-Host \"Procesadores lógicos: $($processor.NumberOfLogicalProcessors)\"\nWrite-Host \"\"\n\n$totalRAM = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)\n$freeRAM = [math]::Round($operatingSystem.FreePhysicalMemory / 1MB, 2)\nWrite-Host \"Memoria RAM Total: $totalRAM GB\" -ForegroundColor Blue\nWrite-Host \"Memoria RAM Libre: $freeRAM MB\"\nWrite-Host \"\"\n\nWrite-Host \"BIOS: $($bios.Manufacturer) - Versión $($bios.SMBIOSBIOSVersion)\"', 'powershell', NULL, NULL, 'sistema, información, hardware', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:25:58', 1, '2025-10-29 16:25:58', 1),
(3, 'Listar Procesos por Uso de CPU', 'Lista los procesos que más CPU están consumiendo', '$topCount = {{topCount}}\n\nWrite-Host \"=== TOP $topCount PROCESOS POR USO DE CPU ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\nGet-Process | \n    Sort-Object CPU -Descending | \n    Select-Object -First $topCount ProcessName, CPU, WorkingSet, Id |\n    Format-Table -AutoSize\n\nWrite-Host \"\"\nWrite-Host \"Memoria WorkingSet en bytes\" -ForegroundColor Yellow', 'powershell', NULL, '{\"topCount\":{\"type\":\"integer\",\"required\":false,\"default\":10,\"min\":1,\"max\":100,\"description\":\"Cantidad de procesos a mostrar\"}}', 'procesos, rendimiento, diagnóstico', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(4, 'Espacio en Disco', 'Muestra el espacio disponible en todas las unidades', 'Write-Host \"=== ESPACIO EN DISCO ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\nGet-PSDrive -PSProvider FileSystem | \n    Where-Object { $_.Used -ne $null } |\n    ForEach-Object {\n        $drive = $_\n        $usedGB = [math]::Round($drive.Used / 1GB, 2)\n        $freeGB = [math]::Round($drive.Free / 1GB, 2)\n        $totalGB = $usedGB + $freeGB\n        $percentUsed = [math]::Round(($usedGB / $totalGB) * 100, 2)\n        \n        Write-Host \"Unidad: $($drive.Name):\" -ForegroundColor Green\n        Write-Host \"  Total: $totalGB GB\"\n        Write-Host \"  Usado: $usedGB GB ($percentUsed%)\"\n        Write-Host \"  Libre: $freeGB GB\"\n        Write-Host \"\"\n    }', 'powershell', NULL, NULL, 'disco, almacenamiento, sistema', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(5, 'Servicios de Windows', 'Lista servicios según su estado', '$estado = \"{{estado}}\"\n\nWrite-Host \"=== SERVICIOS DE WINDOWS ($estado) ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\nif ($estado -eq \"todos\") {\n    Get-Service | Sort-Object DisplayName | Format-Table -AutoSize Name, DisplayName, Status, StartType\n} else {\n    Get-Service | Where-Object { $_.Status -eq $estado } | \n        Sort-Object DisplayName | \n        Format-Table -AutoSize Name, DisplayName, Status, StartType\n}\n\n$count = (Get-Service | Where-Object { if($estado -eq \"todos\") { $true } else { $_.Status -eq $estado } }).Count\nWrite-Host \"\"\nWrite-Host \"Total de servicios: $count\" -ForegroundColor Yellow', 'powershell', NULL, '{\"estado\":{\"type\":\"string\",\"required\":false,\"default\":\"Running\",\"enum\":[\"Running\",\"Stopped\",\"todos\"],\"description\":\"Estado de los servicios a listar\"}}', 'servicios, windows, sistema', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(6, 'Test de Puerto', 'Verifica si un puerto específico está abierto en un host', '$hostName = \"{{hostName}}\"\n$port = {{port}}\n\nWrite-Host \"Probando conexión a $hostName en puerto $port...\" -ForegroundColor Cyan\n\ntry {\n    $result = Test-NetConnection -ComputerName $hostName -Port $port -WarningAction SilentlyContinue\n    \n    if ($result.TcpTestSucceeded) {\n        Write-Host \"\"\n        Write-Host \"✓ Puerto $port ABIERTO\" -ForegroundColor Green\n        Write-Host \"  Dirección remota: $($result.RemoteAddress)\"\n        Write-Host \"  Ping exitoso: $($result.PingSucceeded)\"\n    } else {\n        Write-Host \"\"\n        Write-Host \"✗ Puerto $port CERRADO o FILTRADO\" -ForegroundColor Red\n    }\n} catch {\n    Write-Host \"\"\n    Write-Host \"✗ Error al conectar: $($_.Exception.Message)\" -ForegroundColor Red\n}', 'powershell', NULL, '{\"hostName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre o IP del host\",\"pattern\":\"^[a-zA-Z0-9.-]+$\"},\"port\":{\"type\":\"integer\",\"required\":true,\"description\":\"Número de puerto\",\"min\":1,\"max\":65535}}', 'red, puerto, conectividad', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(7, 'Limpiar Archivos Temporales', 'Limpia archivos temporales del sistema', 'Write-Host \"=== LIMPIEZA DE ARCHIVOS TEMPORALES ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\n$tempPaths = @(\n    $env:TEMP,\n    \"C:\\Windows\\Temp\"\n)\n\n$totalDeleted = 0\n$totalSize = 0\n\nforeach ($path in $tempPaths) {\n    if (Test-Path $path) {\n        Write-Host \"Limpiando: $path\" -ForegroundColor Yellow\n        \n        $files = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue\n        \n        foreach ($file in $files) {\n            try {\n                $size = $file.Length\n                Remove-Item $file.FullName -Force -ErrorAction Stop\n                $totalDeleted++\n                $totalSize += $size\n            } catch {\n                # Ignorar archivos en uso\n            }\n        }\n    }\n}\n\n$sizeMB = [math]::Round($totalSize / 1MB, 2)\nWrite-Host \"\"\nWrite-Host \"✓ Archivos eliminados: $totalDeleted\" -ForegroundColor Green\nWrite-Host \"✓ Espacio liberado: $sizeMB MB\" -ForegroundColor Green', 'powershell', NULL, NULL, 'mantenimiento, limpieza, sistema', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(8, 'Usuarios Locales', 'Lista todos los usuarios locales del sistema', 'Write-Host \"=== USUARIOS LOCALES DEL SISTEMA ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\nGet-LocalUser | \n    Sort-Object Name |\n    ForEach-Object {\n        $user = $_\n        $color = if ($user.Enabled) { \"Green\" } else { \"Red\" }\n        $status = if ($user.Enabled) { \"Activo\" } else { \"Deshabilitado\" }\n        \n        Write-Host \"Usuario: $($user.Name)\" -ForegroundColor $color\n        Write-Host \"  Nombre completo: $($user.FullName)\"\n        Write-Host \"  Descripción: $($user.Description)\"\n        Write-Host \"  Estado: $status\"\n        Write-Host \"  Último inicio: $($user.LastLogon)\"\n        Write-Host \"  Contraseña expira: $($user.PasswordExpires)\"\n        Write-Host \"\"\n    }\n\n$totalUsers = (Get-LocalUser).Count\n$activeUsers = (Get-LocalUser | Where-Object { $_.Enabled }).Count\nWrite-Host \"Total usuarios: $totalUsers (Activos: $activeUsers)\" -ForegroundColor Yellow', 'powershell', NULL, NULL, 'usuarios, seguridad, sistema', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(9, 'Eventos del Sistema', 'Muestra los últimos eventos del sistema', '$tipo = \"{{tipo}}\"\n$cantidad = {{cantidad}}\n\nWrite-Host \"=== ÚLTIMOS $cantidad EVENTOS ($tipo) ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\n$logName = switch ($tipo) {\n    \"Sistema\" { \"System\" }\n    \"Aplicación\" { \"Application\" }\n    \"Seguridad\" { \"Security\" }\n    default { \"System\" }\n}\n\ntry {\n    Get-EventLog -LogName $logName -Newest $cantidad |\n        ForEach-Object {\n            $color = switch ($_.EntryType) {\n                \"Error\" { \"Red\" }\n                \"Warning\" { \"Yellow\" }\n                default { \"White\" }\n            }\n            \n            Write-Host \"[$($_.TimeGenerated)] $($_.EntryType)\" -ForegroundColor $color\n            Write-Host \"  Origen: $($_.Source)\"\n            Write-Host \"  EventID: $($_.EventID)\"\n            Write-Host \"  Mensaje: $($_.Message.Substring(0, [Math]::Min(200, $_.Message.Length)))...\"\n            Write-Host \"\"\n        }\n} catch {\n    Write-Host \"Error al acceder al registro de eventos: $($_.Exception.Message)\" -ForegroundColor Red\n}', 'powershell', NULL, '{\"tipo\":{\"type\":\"string\",\"required\":false,\"default\":\"Sistema\",\"enum\":[\"Sistema\",\"Aplicación\",\"Seguridad\"],\"description\":\"Tipo de eventos a mostrar\"},\"cantidad\":{\"type\":\"integer\",\"required\":false,\"default\":10,\"min\":1,\"max\":100,\"description\":\"Cantidad de eventos a mostrar\"}}', 'eventos, logs, diagnóstico', 1, 1, 1, '2025-10-29 15:49:02', '2025-10-29 16:09:17', 1, NULL, 0),
(10, 'Información de Red', 'Muestra configuración de red del sistema', 'Write-Host \"=== CONFIGURACIÓN DE RED ===\" -ForegroundColor Cyan\nWrite-Host \"\"\n\nGet-NetIPConfiguration | ForEach-Object {\n    $adapter = $_\n    \n    Write-Host \"Adaptador: $($adapter.InterfaceAlias)\" -ForegroundColor Green\n    Write-Host \"  Índice: $($adapter.InterfaceIndex)\"\n    Write-Host \"  Descripción: $($adapter.InterfaceDescription)\"\n    \n    if ($adapter.IPv4Address) {\n        Write-Host \"  IPv4: $($adapter.IPv4Address.IPAddress)\" -ForegroundColor Yellow\n        Write-Host \"  Máscara: $($adapter.IPv4Address.PrefixLength) bits\"\n    }\n    \n    if ($adapter.IPv6Address) {\n        Write-Host \"  IPv6: $($adapter.IPv6Address.IPAddress)\" -ForegroundColor Cyan\n    }\n    \n    if ($adapter.IPv4DefaultGateway) {\n        Write-Host \"  Gateway: $($adapter.IPv4DefaultGateway.NextHop)\"\n    }\n    \n    if ($adapter.DNSServer) {\n        Write-Host \"  DNS Servers:\"\n        $adapter.DNSServer.ServerAddresses | ForEach-Object {\n            Write-Host \"    - $_\"\n        }\n    }\n    \n    Write-Host \"\"\n}', 'powershell', NULL, NULL, 'red, ip, configuración', 1, 1, 1, '2025-10-29 15:49:03', '2025-10-29 16:09:17', 1, NULL, 0),
(11, 'Crear Usuario Local', 'Crea un nuevo usuario local en el sistema', '$username = $args[0]\n$password = $args[1] | ConvertTo-SecureString -AsPlainText -Force\n$fullName = $args[2]\n\nNew-LocalUser -Name $username -Password $password -FullName $fullName -Description \"Usuario creado desde script\"\nWrite-Host \"Usuario $username creado exitosamente\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de usuario\"},\"password\":{\"type\":\"string\",\"required\":true,\"description\":\"Contraseña\"},\"fullName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre completo\"}}', 'usuarios, crear, administración', 1, NULL, NULL, '2025-10-29 16:34:20', '2025-10-29 16:34:20', 1, NULL, 0),
(12, 'Eliminar Usuario Local', 'Elimina un usuario local del sistema', '$username = $args[0]\nRemove-LocalUser -Name $username\nWrite-Host \"Usuario $username eliminado exitosamente\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de usuario a eliminar\"}}', 'usuarios, eliminar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(13, 'Listar Usuarios Activos', 'Lista todos los usuarios locales activos', 'Get-LocalUser | Where-Object {$_.Enabled -eq $true} | Select-Object Name, FullName, Description, LastLogon | Format-Table -AutoSize', 'powershell', NULL, NULL, 'usuarios, listar, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(14, 'Deshabilitar Usuario', 'Deshabilita un usuario local', '$username = $args[0]\nDisable-LocalUser -Name $username\nWrite-Host \"Usuario $username deshabilitado\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario a deshabilitar\"}}', 'usuarios, deshabilitar, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(15, 'Habilitar Usuario', 'Habilita un usuario local previamente deshabilitado', '$username = $args[0]\nEnable-LocalUser -Name $username\nWrite-Host \"Usuario $username habilitado\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario a habilitar\"}}', 'usuarios, habilitar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(16, 'Cambiar Contraseña de Usuario', 'Cambia la contraseña de un usuario local', '$username = $args[0]\n$newPassword = $args[1] | ConvertTo-SecureString -AsPlainText -Force\nSet-LocalUser -Name $username -Password $newPassword\nWrite-Host \"Contraseña cambiada para $username\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario\"},\"newPassword\":{\"type\":\"string\",\"required\":true,\"description\":\"Nueva contraseña\"}}', 'usuarios, contraseña, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(17, 'Agregar Usuario a Grupo', 'Agrega un usuario a un grupo local', '$username = $args[0]\n$groupName = $args[1]\nAdd-LocalGroupMember -Group $groupName -Member $username\nWrite-Host \"Usuario $username agregado al grupo $groupName\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario\"},\"groupName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del grupo\"}}', 'usuarios, grupos, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(18, 'Remover Usuario de Grupo', 'Remueve un usuario de un grupo local', '$username = $args[0]\n$groupName = $args[1]\nRemove-LocalGroupMember -Group $groupName -Member $username\nWrite-Host \"Usuario $username removido del grupo $groupName\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario\"},\"groupName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del grupo\"}}', 'usuarios, grupos, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(19, 'Listar Grupos Locales', 'Lista todos los grupos locales del sistema', 'Get-LocalGroup | Select-Object Name, Description | Format-Table -AutoSize', 'powershell', NULL, NULL, 'grupos, listar, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(20, 'Miembros de Grupo', 'Lista los miembros de un grupo específico', '$groupName = $args[0]\nGet-LocalGroupMember -Group $groupName | Select-Object Name, ObjectClass, PrincipalSource | Format-Table -AutoSize', 'powershell', NULL, '{\"groupName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del grupo\"}}', 'grupos, usuarios, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(21, 'Usuarios con Último Login', 'Muestra usuarios y su último inicio de sesión', 'Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordLastSet | Sort-Object LastLogon -Descending | Format-Table -AutoSize', 'powershell', NULL, NULL, 'usuarios, auditoría, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(22, 'Usuarios Sin Contraseña', 'Lista usuarios que no tienen contraseña configurada', 'Get-LocalUser | Where-Object {$_.PasswordRequired -eq $false} | Select-Object Name, Enabled, Description | Format-Table -AutoSize', 'powershell', NULL, NULL, 'usuarios, seguridad, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(23, 'Usuarios con Contraseña Expirada', 'Lista usuarios cuya contraseña ha expirado', 'Get-LocalUser | Where-Object {$_.PasswordExpired -eq $true} | Select-Object Name, PasswordLastSet, PasswordExpired | Format-Table -AutoSize', 'powershell', NULL, NULL, 'usuarios, contraseña, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(24, 'Forzar Cambio de Contraseña', 'Fuerza a un usuario a cambiar su contraseña en el próximo login', '$username = $args[0]\nSet-LocalUser -Name $username -PasswordNeverExpires $false -UserMayChangePassword $true\n$user = Get-LocalUser -Name $username\n$user.PasswordExpired = $true\nWrite-Host \"Usuario $username deberá cambiar contraseña en próximo login\"', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario\"}}', 'usuarios, contraseña, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(25, 'Crear Grupo Local', 'Crea un nuevo grupo local', '$groupName = $args[0]\n$description = $args[1]\nNew-LocalGroup -Name $groupName -Description $description\nWrite-Host \"Grupo $groupName creado exitosamente\"', 'powershell', NULL, '{\"groupName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del grupo\"},\"description\":{\"type\":\"string\",\"required\":true,\"description\":\"Descripción del grupo\"}}', 'grupos, crear, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(26, 'Eliminar Grupo Local', 'Elimina un grupo local', '$groupName = $args[0]\nRemove-LocalGroup -Name $groupName\nWrite-Host \"Grupo $groupName eliminado\"', 'powershell', NULL, '{\"groupName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del grupo\"}}', 'grupos, eliminar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(27, 'Información de Usuario', 'Muestra información detallada de un usuario', '$username = $args[0]\nGet-LocalUser -Name $username | Format-List *', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario\"}}', 'usuarios, información, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(28, 'Usuarios Deshabilitados', 'Lista usuarios deshabilitados', 'Get-LocalUser | Where-Object {$_.Enabled -eq $false} | Select-Object Name, Description, LastLogon | Format-Table -AutoSize', 'powershell', NULL, NULL, 'usuarios, auditoría, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(29, 'Renombrar Usuario', 'Renombra un usuario local', '$oldName = $args[0]\n$newName = $args[1]\nRename-LocalUser -Name $oldName -NewName $newName\nWrite-Host \"Usuario renombrado de $oldName a $newName\"', 'powershell', NULL, '{\"oldName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre actual\"},\"newName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nuevo nombre\"}}', 'usuarios, renombrar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(30, 'Sesiones Activas de Usuarios', 'Muestra las sesiones activas de usuarios en el sistema', 'query user 2>&1', 'powershell', NULL, NULL, 'usuarios, sesiones, monitoreo', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(31, 'Detener Proceso por Nombre', 'Detiene todos los procesos con un nombre específico', '$processName = $args[0]\nStop-Process -Name $processName -Force\nWrite-Host \"Proceso $processName detenido\"', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"}}', 'procesos, detener, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(32, 'Detener Proceso por PID', 'Detiene un proceso por su ID', '$pid = $args[0]\nStop-Process -Id $pid -Force\nWrite-Host \"Proceso con PID $pid detenido\"', 'powershell', NULL, '{\"pid\":{\"type\":\"string\",\"required\":true,\"description\":\"ID del proceso\"}}', 'procesos, detener, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(33, 'Procesos por Uso de RAM', 'Lista procesos ordenados por uso de memoria', '$top = $args[0]\nGet-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First $top Name, Id, @{N=\'RAM(MB)\';E={[math]::Round($_.WorkingSet64/1MB,2)}}, CPU | Format-Table -AutoSize', 'powershell', NULL, '{\"top\":{\"type\":\"string\",\"required\":true,\"default\":\"20\",\"description\":\"Número de procesos a mostrar\"}}', 'procesos, memoria, rendimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(34, 'Información Detallada de Proceso', 'Muestra información detallada de un proceso', '$processName = $args[0]\nGet-Process -Name $processName | Format-List *', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"}}', 'procesos, información, diagnóstico', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(35, 'Procesos de Usuario Específico', 'Lista procesos ejecutados por un usuario', '$username = $args[0]\nGet-WmiObject Win32_Process | Where-Object {$_.GetOwner().User -eq $username} | Select-Object ProcessName, ProcessId, @{N=\'Owner\';E={$_.GetOwner().User}} | Format-Table -AutoSize', 'powershell', NULL, '{\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de usuario\"}}', 'procesos, usuarios, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(36, 'Procesos con Más Threads', 'Lista procesos con mayor número de hilos', '$top = $args[0]\nGet-Process | Sort-Object Threads.Count -Descending | Select-Object -First $top Name, Id, @{N=\'Threads\';E={$_.Threads.Count}} | Format-Table -AutoSize', 'powershell', NULL, '{\"top\":{\"type\":\"string\",\"required\":true,\"default\":\"15\",\"description\":\"Número a mostrar\"}}', 'procesos, threads, rendimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(37, 'Procesos Zombies', 'Identifica procesos que no responden', 'Get-Process | Where-Object {$_.Responding -eq $false} | Select-Object Name, Id, Responding, StartTime | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, diagnóstico, rendimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(38, 'Reiniciar Proceso', 'Reinicia un proceso (lo detiene y lo vuelve a iniciar)', '$processName = $args[0]\n$processPath = (Get-Process -Name $processName).Path\nStop-Process -Name $processName -Force\nStart-Sleep -Seconds 2\nStart-Process $processPath\nWrite-Host \"Proceso $processName reiniciado\"', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"}}', 'procesos, reiniciar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(39, 'Tiempo de Ejecución de Procesos', 'Muestra cuánto tiempo llevan ejecutándose los procesos', 'Get-Process | Where-Object {$_.StartTime} | Select-Object Name, Id, StartTime, @{N=\'Uptime\';E={(Get-Date) - $_.StartTime}} | Sort-Object Uptime -Descending | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, monitoreo, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(40, 'Detener Múltiples Procesos', 'Detiene varios procesos cuyos nombres coincidan con un patrón', '$pattern = $args[0]\nGet-Process | Where-Object {$_.Name -like \"*$pattern*\"} | Stop-Process -Force\nWrite-Host \"Procesos que coinciden con \'$pattern\' detenidos\"', 'powershell', NULL, '{\"pattern\":{\"type\":\"string\",\"required\":true,\"description\":\"Patrón de búsqueda\"}}', 'procesos, detener, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(41, 'Procesos con Mayor Uso de CPU Histórico', 'Muestra procesos con mayor tiempo de CPU acumulado', '$top = $args[0]\nGet-Process | Where-Object {$_.CPU} | Sort-Object CPU -Descending | Select-Object -First $top Name, Id, @{N=\'CPU(s)\';E={[math]::Round($_.CPU,2)}} | Format-Table -AutoSize', 'powershell', NULL, '{\"top\":{\"type\":\"string\",\"required\":true,\"default\":\"15\",\"description\":\"Número a mostrar\"}}', 'procesos, cpu, rendimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(42, 'Establecer Prioridad de Proceso', 'Cambia la prioridad de un proceso', '$processName = $args[0]\n$priority = $args[1]\n$process = Get-Process -Name $processName\n$process.PriorityClass = $priority\nWrite-Host \"Prioridad de $processName establecida a $priority\"', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"},\"priority\":{\"type\":\"string\",\"required\":true,\"default\":\"Normal\",\"description\":\"Prioridad (Idle, BelowNormal, Normal, AboveNormal, High, RealTime)\"}}', 'procesos, prioridad, rendimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(43, 'Procesos con Ventanas Abiertas', 'Lista procesos que tienen ventanas de interfaz gráfica', 'Get-Process | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object Name, Id, MainWindowTitle | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, ventanas, interfaz', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(44, 'Módulos Cargados por Proceso', 'Lista los módulos/DLLs cargados por un proceso', '$processName = $args[0]\nGet-Process -Name $processName | Select-Object -ExpandProperty Modules | Select-Object FileName, FileVersion | Format-Table -AutoSize', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"}}', 'procesos, módulos, diagnóstico', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(45, 'Iniciar Proceso con Parámetros', 'Inicia un proceso con argumentos específicos', '$exePath = $args[0]\n$arguments = $args[1]\nStart-Process -FilePath $exePath -ArgumentList $arguments\nWrite-Host \"Proceso iniciado: $exePath $arguments\"', 'powershell', NULL, '{\"exePath\":{\"type\":\"string\",\"required\":true,\"description\":\"Ruta del ejecutable\"},\"arguments\":{\"type\":\"string\",\"required\":false,\"description\":\"Argumentos\"}}', 'procesos, iniciar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(46, 'Procesos con Puerto de Red Específico', 'Lista procesos que están usando un puerto específico', '$port = $args[0]\nGet-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {\n    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue\n    [PSCustomObject]@{\n        ProcessName = $proc.Name\n        PID = $_.OwningProcess\n        LocalAddress = $_.LocalAddress\n        LocalPort = $_.LocalPort\n        State = $_.State\n    }\n} | Format-Table -AutoSize', 'powershell', NULL, '{\"port\":{\"type\":\"string\",\"required\":true,\"description\":\"Número de puerto\"}}', 'procesos, red, puertos', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(47, 'Exportar Lista de Procesos', 'Exporta la lista de procesos a un archivo CSV', '$outputPath = $args[0]\nGet-Process | Select-Object Name, Id, CPU, @{N=\'RAM(MB)\';E={[math]::Round($_.WorkingSet64/1MB,2)}}, StartTime | Export-Csv -Path $outputPath -NoTypeInformation\nWrite-Host \"Lista de procesos exportada a $outputPath\"', 'powershell', NULL, '{\"outputPath\":{\"type\":\"string\",\"required\":true,\"default\":\"C:\\\\temp\\\\procesos.csv\",\"description\":\"Ruta del archivo de salida\"}}', 'procesos, exportar, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(48, 'Procesos Hijos de un Proceso Padre', 'Lista todos los procesos hijos de un proceso padre', '$parentPID = $args[0]\nGet-WmiObject Win32_Process | Where-Object {$_.ParentProcessId -eq $parentPID} | Select-Object Name, ProcessId, ParentProcessId | Format-Table -AutoSize', 'powershell', NULL, '{\"parentPID\":{\"type\":\"string\",\"required\":true,\"description\":\"PID del proceso padre\"}}', 'procesos, jerarquía, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(49, 'Línea de Comandos de Procesos', 'Muestra la línea de comandos con la que se iniciaron los procesos', 'Get-WmiObject Win32_Process | Select-Object Name, ProcessId, CommandLine | Format-Table -AutoSize -Wrap', 'powershell', NULL, NULL, 'procesos, comandos, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(50, 'Procesos con Uso de Red Activo', 'Lista procesos con conexiones de red activas', 'Get-NetTCPConnection | Where-Object {$_.State -eq \'Established\'} | ForEach-Object {\n    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue\n    [PSCustomObject]@{\n        ProcessName = $proc.Name\n        PID = $_.OwningProcess\n        LocalAddress = \"$($_.LocalAddress):$($_.LocalPort)\"\n        RemoteAddress = \"$($_.RemoteAddress):$($_.RemotePort)\"\n        State = $_.State\n    }\n} | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, red, conexiones', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(51, 'Matar Proceso en Árbol', 'Detiene un proceso y todos sus procesos hijos', '$parentPID = $args[0]\n$children = Get-WmiObject Win32_Process | Where-Object {$_.ParentProcessId -eq $parentPID}\nforeach ($child in $children) {\n    Stop-Process -Id $child.ProcessId -Force\n}\nStop-Process -Id $parentPID -Force\nWrite-Host \"Proceso $parentPID y sus hijos detenidos\"', 'powershell', NULL, '{\"parentPID\":{\"type\":\"string\",\"required\":true,\"description\":\"PID del proceso padre\"}}', 'procesos, detener, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(52, 'Monitoreo Continuo de CPU', 'Monitorea el uso de CPU de un proceso cada N segundos', '$processName = $args[0]\n$seconds = $args[1]\n$iterations = $args[2]\nfor ($i = 1; $i -le $iterations; $i++) {\n    $cpu = (Get-Process -Name $processName).CPU\n    Write-Host \"[$i] CPU: $([math]::Round($cpu,2))s\"\n    Start-Sleep -Seconds $seconds\n}', 'powershell', NULL, '{\"processName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del proceso\"},\"seconds\":{\"type\":\"string\",\"required\":true,\"default\":\"5\",\"description\":\"Intervalo en segundos\"},\"iterations\":{\"type\":\"string\",\"required\":true,\"default\":\"10\",\"description\":\"Número de iteraciones\"}}', 'procesos, monitoreo, cpu', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(53, 'Procesos por Propietario', 'Agrupa procesos por el usuario propietario', 'Get-WmiObject Win32_Process | ForEach-Object {\n    [PSCustomObject]@{\n        ProcessName = $_.Name\n        PID = $_.ProcessId\n        Owner = $_.GetOwner().User\n    }\n} | Group-Object Owner | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, usuarios, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(54, 'Detectar Procesos Duplicados', 'Identifica procesos que se están ejecutando múltiples veces', 'Get-Process | Group-Object Name | Where-Object {$_.Count -gt 1} | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, duplicados, diagnóstico', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(55, 'Uso de Memoria por Tipo de Proceso', 'Agrupa y suma el uso de memoria por nombre de proceso', 'Get-Process | Group-Object Name | ForEach-Object {\n    [PSCustomObject]@{\n        ProcessName = $_.Name\n        Count = $_.Count\n        \'TotalRAM(MB)\' = [math]::Round(($_.Group | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 2)\n    }\n} | Sort-Object \'TotalRAM(MB)\' -Descending | Format-Table -AutoSize', 'powershell', NULL, NULL, 'procesos, memoria, estadísticas', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(56, 'Iniciar Servicio', 'Inicia un servicio de Windows', '$serviceName = $args[0]\nStart-Service -Name $serviceName\nWrite-Host \"Servicio $serviceName iniciado\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, iniciar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(57, 'Detener Servicio', 'Detiene un servicio de Windows', '$serviceName = $args[0]\nStop-Service -Name $serviceName -Force\nWrite-Host \"Servicio $serviceName detenido\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, detener, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(58, 'Reiniciar Servicio', 'Reinicia un servicio de Windows', '$serviceName = $args[0]\nRestart-Service -Name $serviceName -Force\nWrite-Host \"Servicio $serviceName reiniciado\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, reiniciar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(59, 'Estado de Servicio', 'Muestra el estado detallado de un servicio', '$serviceName = $args[0]\nGet-Service -Name $serviceName | Format-List *', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, estado, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(60, 'Servicios Detenidos', 'Lista todos los servicios que están detenidos', 'Get-Service | Where-Object {$_.Status -eq \'Stopped\'} | Select-Object Name, DisplayName, StartType | Format-Table -AutoSize', 'powershell', NULL, NULL, 'servicios, detenidos, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(61, 'Servicios en Ejecución', 'Lista todos los servicios actualmente en ejecución', 'Get-Service | Where-Object {$_.Status -eq \'Running\'} | Select-Object Name, DisplayName, StartType | Format-Table -AutoSize', 'powershell', NULL, NULL, 'servicios, running, monitoreo', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(62, 'Cambiar Tipo de Inicio de Servicio', 'Cambia el tipo de inicio de un servicio (Automatic, Manual, Disabled)', '$serviceName = $args[0]\n$startupType = $args[1]\nSet-Service -Name $serviceName -StartupType $startupType\nWrite-Host \"Tipo de inicio de $serviceName cambiado a $startupType\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"},\"startupType\":{\"type\":\"string\",\"required\":true,\"default\":\"Automatic\",\"description\":\"Tipo (Automatic, Manual, Disabled)\"}}', 'servicios, configuración, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(63, 'Servicios Automáticos Detenidos', 'Lista servicios configurados como automáticos pero que están detenidos', 'Get-Service | Where-Object {$_.StartType -eq \'Automatic\' -and $_.Status -ne \'Running\'} | Select-Object Name, DisplayName, Status | Format-Table -AutoSize', 'powershell', NULL, NULL, 'servicios, diagnóstico, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(64, 'Dependencias de Servicio', 'Muestra los servicios de los que depende un servicio', '$serviceName = $args[0]\nGet-Service -Name $serviceName | Select-Object -ExpandProperty ServicesDependedOn | Select-Object Name, Status, DisplayName | Format-Table -AutoSize', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, dependencias, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(65, 'Servicios que Dependen de Este', 'Muestra qué servicios dependen de un servicio específico', '$serviceName = $args[0]\nGet-Service -Name $serviceName | Select-Object -ExpandProperty DependentServices | Select-Object Name, Status, DisplayName | Format-Table -AutoSize', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, dependencias, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(66, 'Buscar Servicio por Nombre', 'Busca servicios que coincidan con un patrón', '$pattern = $args[0]\nGet-Service | Where-Object {$_.Name -like \"*$pattern*\" -or $_.DisplayName -like \"*$pattern*\"} | Select-Object Name, DisplayName, Status, StartType | Format-Table -AutoSize', 'powershell', NULL, '{\"pattern\":{\"type\":\"string\",\"required\":true,\"description\":\"Patrón de búsqueda\"}}', 'servicios, buscar, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(67, 'Información WMI de Servicio', 'Obtiene información detallada WMI de un servicio', '$serviceName = $args[0]\nGet-WmiObject Win32_Service | Where-Object {$_.Name -eq $serviceName} | Format-List *', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, wmi, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(68, 'Servicios con Cuenta Específica', 'Lista servicios que se ejecutan con una cuenta específica', '$account = $args[0]\nGet-WmiObject Win32_Service | Where-Object {$_.StartName -like \"*$account*\"} | Select-Object Name, DisplayName, StartName, State | Format-Table -AutoSize', 'powershell', NULL, '{\"account\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de cuenta\"}}', 'servicios, cuentas, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(69, 'Cambiar Cuenta de Servicio', 'Cambia la cuenta con la que se ejecuta un servicio', '$serviceName = $args[0]\n$username = $args[1]\n$password = $args[2]\n$service = Get-WmiObject Win32_Service -Filter \"Name=\'$serviceName\'\"\n$service.Change($null,$null,$null,$null,$null,$null,$username,$password)\nWrite-Host \"Cuenta de servicio $serviceName cambiada a $username\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"},\"username\":{\"type\":\"string\",\"required\":true,\"description\":\"Usuario (ej: .\\\\Usuario o DOMAIN\\\\Usuario)\"},\"password\":{\"type\":\"string\",\"required\":true,\"description\":\"Contraseña\"}}', 'servicios, cuentas, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(70, 'Servicios de Terceros', 'Lista servicios que no son de Microsoft', 'Get-WmiObject Win32_Service | Where-Object {$_.PathName -notlike \"*Windows*\" -and $_.PathName -notlike \"*Microsoft*\"} | Select-Object Name, DisplayName, PathName, State | Format-Table -AutoSize', 'powershell', NULL, NULL, 'servicios, terceros, auditoría', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(71, 'Servicios Sin Descripción', 'Lista servicios que no tienen descripción', 'Get-Service | Where-Object {-not $_.DisplayName -or $_.DisplayName -eq $_.Name} | Select-Object Name, Status, StartType | Format-Table -AutoSize', 'powershell', NULL, NULL, 'servicios, auditoría, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(72, 'Exportar Configuración de Servicios', 'Exporta la configuración de todos los servicios a CSV', '$outputPath = $args[0]\nGet-WmiObject Win32_Service | Select-Object Name, DisplayName, State, StartMode, StartName, PathName | Export-Csv -Path $outputPath -NoTypeInformation\nWrite-Host \"Configuración de servicios exportada a $outputPath\"', 'powershell', NULL, '{\"outputPath\":{\"type\":\"string\",\"required\":true,\"default\":\"C:\\\\temp\\\\servicios.csv\",\"description\":\"Ruta del archivo\"}}', 'servicios, exportar, backup', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(73, 'Tiempo de Ejecución de Servicio', 'Muestra cuánto tiempo lleva ejecutándose un servicio', '$serviceName = $args[0]\n$service = Get-Service -Name $serviceName\nif ($service.Status -eq \'Running\') {\n    $process = Get-WmiObject Win32_Service | Where-Object {$_.Name -eq $serviceName} | ForEach-Object {Get-Process -Id $_.ProcessId}\n    $uptime = (Get-Date) - $process.StartTime\n    Write-Host \"Servicio $serviceName lleva ejecutándose: $($uptime.Days) días, $($uptime.Hours) horas, $($uptime.Minutes) minutos\"\n} else {\n    Write-Host \"Servicio $serviceName no está en ejecución\"\n}', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, uptime, monitoreo', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(74, 'Crear Nuevo Servicio', 'Crea un nuevo servicio de Windows', '$serviceName = $args[0]\n$displayName = $args[1]\n$binaryPath = $args[2]\n$startupType = $args[3]\nNew-Service -Name $serviceName -DisplayName $displayName -BinaryPathName $binaryPath -StartupType $startupType\nWrite-Host \"Servicio $serviceName creado\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"},\"displayName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre para mostrar\"},\"binaryPath\":{\"type\":\"string\",\"required\":true,\"description\":\"Ruta del ejecutable\"},\"startupType\":{\"type\":\"string\",\"required\":true,\"default\":\"Manual\",\"description\":\"Tipo de inicio\"}}', 'servicios, crear, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(75, 'Eliminar Servicio', 'Elimina un servicio de Windows', '$serviceName = $args[0]\nStop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue\nsc.exe delete $serviceName\nWrite-Host \"Servicio $serviceName eliminado\"', 'powershell', NULL, '{\"serviceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre del servicio\"}}', 'servicios, eliminar, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(76, 'Configuración IP', 'Muestra la configuración IP de todas las interfaces', 'Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, PrefixLength, AddressFamily | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, ip, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(77, 'Configurar IP Estática', 'Configura una dirección IP estática en una interfaz', '$interfaceAlias = $args[0]\n$ipAddress = $args[1]\n$prefixLength = $args[2]\n$gateway = $args[3]\nNew-NetIPAddress -InterfaceAlias $interfaceAlias -IPAddress $ipAddress -PrefixLength $prefixLength -DefaultGateway $gateway\nWrite-Host \"IP estática configurada en $interfaceAlias\"', 'powershell', NULL, '{\"interfaceAlias\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"},\"ipAddress\":{\"type\":\"string\",\"required\":true,\"description\":\"Dirección IP\"},\"prefixLength\":{\"type\":\"string\",\"required\":true,\"default\":\"24\",\"description\":\"Máscara (ej: 24)\"},\"gateway\":{\"type\":\"string\",\"required\":true,\"description\":\"Puerta de enlace\"}}', 'red, ip, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(78, 'Configurar DHCP', 'Configura una interfaz para obtener IP por DHCP', '$interfaceAlias = $args[0]\nSet-NetIPInterface -InterfaceAlias $interfaceAlias -Dhcp Enabled\nWrite-Host \"DHCP habilitado en $interfaceAlias\"', 'powershell', NULL, '{\"interfaceAlias\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"}}', 'red, dhcp, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(79, 'Configurar DNS', 'Configura los servidores DNS de una interfaz', '$interfaceAlias = $args[0]\n$primaryDNS = $args[1]\n$secondaryDNS = $args[2]\nSet-DnsClientServerAddress -InterfaceAlias $interfaceAlias -ServerAddresses $primaryDNS,$secondaryDNS\nWrite-Host \"DNS configurado en $interfaceAlias\"', 'powershell', NULL, '{\"interfaceAlias\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"},\"primaryDNS\":{\"type\":\"string\",\"required\":true,\"description\":\"DNS primario\"},\"secondaryDNS\":{\"type\":\"string\",\"required\":false,\"description\":\"DNS secundario\"}}', 'red, dns, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(80, 'Limpiar Caché DNS', 'Limpia la caché DNS del sistema', 'Clear-DnsClientCache\nWrite-Host \"Caché DNS limpiada\"', 'powershell', NULL, NULL, 'red, dns, mantenimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(81, 'Mostrar Caché DNS', 'Muestra las entradas en la caché DNS', 'Get-DnsClientCache | Select-Object Name, Type, TimeToLive, Data | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, dns, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(82, 'Tabla de Enrutamiento', 'Muestra la tabla de rutas del sistema', 'Get-NetRoute | Select-Object DestinationPrefix, NextHop, InterfaceAlias, RouteMetric | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, rutas, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(83, 'Agregar Ruta Estática', 'Agrega una ruta estática a la tabla de enrutamiento', '$destination = $args[0]\n$mask = $args[1]\n$gateway = $args[2]\nNew-NetRoute -DestinationPrefix \"$destination/$mask\" -NextHop $gateway\nWrite-Host \"Ruta agregada: $destination/$mask via $gateway\"', 'powershell', NULL, '{\"destination\":{\"type\":\"string\",\"required\":true,\"description\":\"Red destino\"},\"mask\":{\"type\":\"string\",\"required\":true,\"description\":\"Máscara (ej: 24)\"},\"gateway\":{\"type\":\"string\",\"required\":true,\"description\":\"Gateway\"}}', 'red, rutas, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(84, 'Eliminar Ruta', 'Elimina una ruta de la tabla de enrutamiento', '$destination = $args[0]\n$mask = $args[1]\nRemove-NetRoute -DestinationPrefix \"$destination/$mask\" -Confirm:$false\nWrite-Host \"Ruta eliminada: $destination/$mask\"', 'powershell', NULL, '{\"destination\":{\"type\":\"string\",\"required\":true,\"description\":\"Red destino\"},\"mask\":{\"type\":\"string\",\"required\":true,\"description\":\"Máscara\"}}', 'red, rutas, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(85, 'Conexiones TCP Establecidas', 'Lista todas las conexiones TCP establecidas', 'Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, tcp, conexiones', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(86, 'Puertos Escuchando', 'Lista todos los puertos en estado de escucha', 'Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, puertos, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(87, 'Traceroute a Host', 'Realiza un traceroute a un host específico', '$target = $args[0]\nTest-NetConnection -TraceRoute -ComputerName $target | Select-Object -ExpandProperty TraceRoute', 'powershell', NULL, '{\"target\":{\"type\":\"string\",\"required\":true,\"description\":\"Host o IP destino\"}}', 'red, diagnóstico, traceroute', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(88, 'Estadísticas de Red', 'Muestra estadísticas de red detalladas', 'Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes, ReceivedUnicastPackets, SentUnicastPackets | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, estadísticas, monitoreo', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(89, 'Velocidad de Interfaces', 'Muestra la velocidad de enlace de las interfaces de red', 'Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, interfaces, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(90, 'Habilitar Interfaz de Red', 'Habilita una interfaz de red', '$interfaceName = $args[0]\nEnable-NetAdapter -Name $interfaceName\nWrite-Host \"Interfaz $interfaceName habilitada\"', 'powershell', NULL, '{\"interfaceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"}}', 'red, interfaces, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0);
INSERT INTO `scripts` (`id`, `name`, `description`, `body`, `interpreter`, `entry_point`, `parameters_schema`, `tags`, `is_enabled`, `created_by`, `updated_by`, `created_at`, `updated_at`, `version`, `last_executed_at`, `execution_count`) VALUES
(91, 'Deshabilitar Interfaz de Red', 'Deshabilita una interfaz de red', '$interfaceName = $args[0]\nDisable-NetAdapter -Name $interfaceName -Confirm:$false\nWrite-Host \"Interfaz $interfaceName deshabilitada\"', 'powershell', NULL, '{\"interfaceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"}}', 'red, interfaces, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(92, 'Reiniciar Interfaz de Red', 'Reinicia una interfaz de red', '$interfaceName = $args[0]\nRestart-NetAdapter -Name $interfaceName\nWrite-Host \"Interfaz $interfaceName reiniciada\"', 'powershell', NULL, '{\"interfaceName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"}}', 'red, interfaces, administración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(93, 'Cambiar MTU de Interfaz', 'Cambia el MTU de una interfaz de red', '$interfaceAlias = $args[0]\n$mtu = $args[1]\nSet-NetIPInterface -InterfaceAlias $interfaceAlias -NlMtuBytes $mtu\nWrite-Host \"MTU de $interfaceAlias cambiado a $mtu\"', 'powershell', NULL, '{\"interfaceAlias\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la interfaz\"},\"mtu\":{\"type\":\"string\",\"required\":true,\"default\":\"1500\",\"description\":\"Valor MTU\"}}', 'red, mtu, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(94, 'Tabla ARP', 'Muestra la tabla ARP del sistema', 'Get-NetNeighbor | Select-Object IPAddress, LinkLayerAddress, State, InterfaceAlias | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, arp, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(95, 'Limpiar Tabla ARP', 'Limpia la tabla ARP', 'Get-NetNeighbor | Remove-NetNeighbor -Confirm:$false\nWrite-Host \"Tabla ARP limpiada\"', 'powershell', NULL, NULL, 'red, arp, mantenimiento', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(96, 'Test de Ancho de Banda', 'Realiza un test de conectividad y mide el ancho de banda', '$target = $args[0]\n$result = Test-NetConnection -ComputerName $target -InformationLevel Detailed\n$result | Select-Object ComputerName, RemoteAddress, PingSucceeded, PingReplyDetails | Format-List', 'powershell', NULL, '{\"target\":{\"type\":\"string\",\"required\":true,\"description\":\"Host destino\"}}', 'red, diagnóstico, bandwidth', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(97, 'Firewall - Listar Reglas', 'Lista todas las reglas del firewall', 'Get-NetFirewallRule | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize', 'powershell', NULL, NULL, 'red, firewall, seguridad', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(98, 'Firewall - Crear Regla', 'Crea una nueva regla de firewall', '$ruleName = $args[0]\n$port = $args[1]\n$protocol = $args[2]\n$action = $args[3]\nNew-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol $protocol -Action $action\nWrite-Host \"Regla de firewall \'$ruleName\' creada\"', 'powershell', NULL, '{\"ruleName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la regla\"},\"port\":{\"type\":\"string\",\"required\":true,\"description\":\"Puerto\"},\"protocol\":{\"type\":\"string\",\"required\":true,\"default\":\"TCP\",\"description\":\"Protocolo (TCP/UDP)\"},\"action\":{\"type\":\"string\",\"required\":true,\"default\":\"Allow\",\"description\":\"Acción (Allow/Block)\"}}', 'red, firewall, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(99, 'Firewall - Eliminar Regla', 'Elimina una regla del firewall', '$ruleName = $args[0]\nRemove-NetFirewallRule -DisplayName $ruleName\nWrite-Host \"Regla de firewall \'$ruleName\' eliminada\"', 'powershell', NULL, '{\"ruleName\":{\"type\":\"string\",\"required\":true,\"description\":\"Nombre de la regla\"}}', 'red, firewall, configuración', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0),
(100, 'WiFi - Redes Disponibles', 'Lista las redes WiFi disponibles', 'netsh wlan show networks mode=bssid', 'powershell', NULL, NULL, 'red, wifi, información', 1, NULL, NULL, '2025-10-29 16:34:21', '2025-10-29 16:34:21', 1, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `script_versions`
--

CREATE TABLE `script_versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `script_id` int(10) UNSIGNED NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` tinyint(3) UNSIGNED NOT NULL DEFAULT 2,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `last_login_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `full_name`, `is_active`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 'admin', 'admin@gestion-scripts.local', '$2b$12$55ea/sMQkZuwRRXZDLmQw.XEmpi/0kybCgvoYVp5oM96zAZ1XakF.', 1, 'Administrador del Sistema', 1, '2025-10-29 15:48:30', '2025-10-29 16:25:25', '2025-10-29 16:25:25'),
(2, 'user', 'user@gestion-scripts.local', '$2b$12$vz7MiibPMJa5BICaA57KnOoGoni9Ny2QDQalPI6F7gdQTmxeuaev2', 2, 'Usuario Estándar', 1, '2025-10-29 15:48:30', '2025-10-29 16:09:17', '2025-10-29 15:52:02');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_entity` (`entity`,`entity_id`),
  ADD KEY `fk_audit_performed_by` (`performed_by`);

--
-- Indices de la tabla `execution_logs`
--
ALTER TABLE `execution_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_el_script_id` (`script_id`),
  ADD KEY `idx_el_executed_by` (`executed_by`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_name` (`name`);

--
-- Indices de la tabla `scripts`
--
ALTER TABLE `scripts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_scripts_created_by` (`created_by`),
  ADD KEY `idx_scripts_is_enabled` (`is_enabled`),
  ADD KEY `fk_scripts_updated_by` (`updated_by`);
ALTER TABLE `scripts` ADD FULLTEXT KEY `ft_scripts_name_desc_tags` (`name`,`description`,`tags`);

--
-- Indices de la tabla `script_versions`
--
ALTER TABLE `script_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sv_script_id` (`script_id`),
  ADD KEY `fk_sv_created_by` (`created_by`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_username` (`username`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `audit_trail`
--
ALTER TABLE `audit_trail`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `execution_logs`
--
ALTER TABLE `execution_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `scripts`
--
ALTER TABLE `scripts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT de la tabla `script_versions`
--
ALTER TABLE `script_versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD CONSTRAINT `fk_audit_performed_by` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `execution_logs`
--
ALTER TABLE `execution_logs`
  ADD CONSTRAINT `fk_el_executed_by` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_el_script` FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `scripts`
--
ALTER TABLE `scripts`
  ADD CONSTRAINT `fk_scripts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_scripts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `script_versions`
--
ALTER TABLE `script_versions`
  ADD CONSTRAINT `fk_sv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sv_script` FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
