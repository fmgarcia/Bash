const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const logger = require('./logger');
const iconv = require('iconv-lite');

/**
 * Ejecuta un script PowerShell de forma segura
 * Soporta dos modos: visible (abre ventana) y headless (captura salida)
 */
class PowerShellHelper {
  constructor(tmpDir) {
    this.tmpDir = tmpDir || path.join(process.cwd(), 'tmp');
    this.ensureTmpDir();
  }

  /**
   * Asegura que el directorio temporal existe
   */
  async ensureTmpDir() {
    try {
      await fs.mkdir(this.tmpDir, { recursive: true });
    } catch (error) {
      logger.error(`Error creando directorio temporal: ${error.message}`);
    }
  }

  /**
   * Escribe el contenido del script en un archivo temporal
   * @param {string} scriptContent - Contenido del script
   * @param {string} scriptId - ID del script para nombre único
   * @returns {Promise<string>} - Ruta del archivo creado
   */
  async writeScriptToTemp(scriptContent, scriptId) {
    await this.ensureTmpDir();
    
    const filename = `script_${scriptId}_${Date.now()}.ps1`;
    const filePath = path.join(this.tmpDir, filename);
    
    await fs.writeFile(filePath, scriptContent, 'utf8');
    logger.info(`Script temporal creado: ${filePath}`);
    
    return filePath;
  }

  /**
   * Elimina un archivo temporal
   * @param {string} filePath - Ruta del archivo a eliminar
   */
  async deleteScriptFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info(`Script temporal eliminado: ${filePath}`);
    } catch (error) {
      logger.warn(`No se pudo eliminar archivo temporal ${filePath}: ${error.message}`);
    }
  }

  /**
   * Ejecuta el script en modo VISIBLE (abre ventana de PowerShell)
   * NOTA: Solo funcionará si el backend corre en sesión de usuario con UI
   * @param {string} filePath - Ruta del archivo .ps1
   * @returns {Promise<object>} - Información de la ejecución
   */
  async executeVisible(filePath) {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      
      // Crear archivos temporales para capturar stdout y exit code
      const outputFile = path.join(this.tmpDir, `output_${Date.now()}_stdout.txt`);
      const exitCodeFile = path.join(this.tmpDir, `output_${Date.now()}_exitcode.txt`);
      
      // Escapar rutas para PowerShell
      const escapedPath = filePath.replace(/'/g, "''");
      const escapedOutputFile = outputFile.replace(/'/g, "''");
      const escapedExitCodeFile = exitCodeFile.replace(/'/g, "''");
      
      logger.info(`Ejecutando script en modo VISIBLE: ${filePath}`);
      
      // Crear un script wrapper que:
      // 1. Ejecuta el script usando Start-Transcript para capturar toda la salida
      // 2. Muestra la ejecución en pantalla
      // 3. Mantiene la ventana abierta al finalizar
      const wrapperScript = `
# Configurar encoding UTF-8
chcp 65001 > \$null
\$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  INICIANDO EJECUCION DEL SCRIPT" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar transcripción para capturar TODO
Start-Transcript -Path '${escapedOutputFile}' -Force

try {
    # Ejecutar el script
    \$content = Get-Content -Path '${escapedPath}' -Encoding UTF8 -Raw
    \$scriptBlock = [scriptblock]::Create(\$content)
    & \$scriptBlock
    
    \$exitCode = \$LASTEXITCODE
    if (\$null -eq \$exitCode) { \$exitCode = 0 }
    
} catch {
    \$errorMsg = \$_.Exception.Message
    Write-Error \$errorMsg
    \$exitCode = 1
}

# Detener transcripción
Stop-Transcript

# Agregar información adicional legible al archivo de salida
\$finalizacion = Get-Date -Format "yyyy/MM/dd HH:mm:ss"
\$infoAdicional = @"

===============================================
  INFORMACION DE EJECUCION
===============================================
Fecha de finalizacion: \$finalizacion
Exit Code: \$exitCode
Estado: \$(if(\$exitCode -eq 0){'Exitoso'}else{'Fallido'})
===============================================
"@

Add-Content -Path '${escapedOutputFile}' -Value \$infoAdicional -Encoding UTF8

# Guardar exit code
\$exitCode | Out-File -FilePath '${escapedExitCodeFile}' -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  EJECUCION COMPLETADA" -ForegroundColor Green
Write-Host "  Fecha: \$finalizacion" -ForegroundColor White
Write-Host "  Exit Code: \$exitCode" -ForegroundColor \$(if(\$exitCode -eq 0){'Green'}else{'Red'})
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
\$null = \$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
      `.trim();
      
      // Guardar el wrapper script
      const wrapperPath = path.join(this.tmpDir, `wrapper_${Date.now()}.ps1`);
      await fs.writeFile(wrapperPath, wrapperScript, 'utf8');
      
      logger.info(`Wrapper script creado: ${wrapperPath}`);
      logger.info(`Output file: ${outputFile}`);
      logger.info(`Exit code file: ${exitCodeFile}`);
      
      // Ejecutar el wrapper con -NoExit para mantener la ventana abierta
      const psCommand = `Start-Process powershell -ArgumentList '-NoExit','-NoProfile','-ExecutionPolicy','Bypass','-File','${wrapperPath.replace(/'/g, "''")}' -WindowStyle Normal -Wait`;
      
      logger.info(`Comando PowerShell: ${psCommand}`);
      
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command',
        psCommand
      ], {
        windowsHide: false,
        detached: false
      });

      child.on('error', (error) => {
        logger.error(`Error ejecutando script: ${error.message}`);
        reject(error);
      });

      child.on('close', async (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(3);
        
        try {
          // Leer los archivos de salida
          let stdout = '';
          let exitCode = code;
          
          try {
            // Start-Transcript guarda en UTF-8, leer directamente
            stdout = await fs.readFile(outputFile, 'utf8');
            // Eliminar BOM UTF-8 si existe (﻿ - EF BB BF)
            if (stdout.charCodeAt(0) === 0xFEFF) {
              stdout = stdout.substring(1);
            }
          } catch (err) {
            logger.warn(`No se pudo leer stdout: ${err.message}`);
          }
          
          try {
            const exitCodeContent = await fs.readFile(exitCodeFile, 'utf8');
            exitCode = parseInt(exitCodeContent.trim()) || 0;
          } catch (err) {
            logger.warn(`No se pudo leer exit code: ${err.message}`);
          }
          
          // Limpiar archivos temporales
          setTimeout(async () => {
            try {
              await fs.unlink(outputFile).catch(() => {});
              await fs.unlink(exitCodeFile).catch(() => {});
              await fs.unlink(wrapperPath).catch(() => {});
            } catch (err) {
              logger.warn(`Error limpiando archivos temporales: ${err.message}`);
            }
          }, 2000);
          
          logger.info(`Script finalizado con código ${exitCode} en ${duration}s`);
          
          resolve({
            exitCode: exitCode,
            stdout: stdout,
            stderr: '',
            duration: parseFloat(duration),
            success: exitCode === 0,
            mode: 'visible'
          });
        } catch (error) {
          logger.error(`Error leyendo resultados: ${error.message}`);
          resolve({
            exitCode: code,
            stdout: '',
            stderr: error.message,
            duration: parseFloat(duration),
            success: false,
            mode: 'visible'
          });
        }
      });
    });
  }

  /**
   * Ejecuta el script en modo HEADLESS (captura salida sin ventana)
   * @param {string} filePath - Ruta del archivo .ps1
   * @param {number} timeout - Timeout en ms (default: 300000 = 5min)
   * @returns {Promise<object>} - Información de la ejecución
   */
  async executeHeadless(filePath, timeout = 300000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let timedOut = false;
      
      logger.info(`Ejecutando script en modo HEADLESS: ${filePath}`);
      
      // PowerShell lee archivos con BOM UTF-8 correctamente
      // Forzamos la lectura del archivo como UTF-8 y configuramos la salida
      const command = `
        $PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
        $content = Get-Content -Path '${filePath}' -Encoding UTF8 -Raw
        $scriptBlock = [scriptblock]::Create($content)
        & $scriptBlock
      `.trim();
      
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command', command
      ], {
        windowsHide: true,
        shell: false
      });

      // Usar buffers y luego convertir a UTF-8
      const stdoutChunks = [];
      const stderrChunks = [];

      // Timeout
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        logger.warn(`Script terminado por timeout después de ${timeout}ms`);
      }, timeout);

      child.stdout.on('data', (data) => {
        stdoutChunks.push(data);
      });

      child.stderr.on('data', (data) => {
        stderrChunks.push(data);
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        logger.error(`Error ejecutando script: ${error.message}`);
        reject(error);
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const duration = ((Date.now() - startTime) / 1000).toFixed(3);
        
        // PowerShell en Windows usa cp850 (OEM) en español
        // Decodificamos desde cp850 a UTF-8
        let stdout = iconv.decode(Buffer.concat(stdoutChunks), 'cp850');
        const stderr = iconv.decode(Buffer.concat(stderrChunks), 'cp850');
        
        // Agregar información adicional legible al final del stdout (igual que en modo visible)
        const finalizacion = new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(',', '');
        
        const infoAdicional = `

===============================================
  INFORMACION DE EJECUCION
===============================================
Fecha de finalizacion: ${finalizacion}
Exit Code: ${code}
Estado: ${code === 0 ? 'Exitoso' : 'Fallido'}
Duracion: ${duration}s
===============================================
`;
        
        stdout += infoAdicional;
        
        if (timedOut) {
          logger.warn(`Script terminado por timeout`);
          resolve({
            exitCode: -1,
            stdout: stdout,
            stderr: stderr + '\n[TIMEOUT] El script excedió el tiempo máximo de ejecución',
            duration: parseFloat(duration),
            success: false,
            mode: 'headless',
            timedOut: true
          });
        } else {
          logger.info(`Script finalizado con código ${code} en ${duration}s`);
          resolve({
            exitCode: code,
            stdout: stdout,
            stderr: stderr,
            duration: parseFloat(duration),
            success: code === 0,
            mode: 'headless'
          });
        }
      });
    });
  }

  /**
   * Ejecuta un script según el modo configurado
   * @param {string} scriptContent - Contenido del script
   * @param {string} scriptId - ID del script
   * @param {string} mode - 'visible' o 'headless'
   * @param {boolean} deleteAfter - Eliminar archivo temporal después
   * @returns {Promise<object>} - Resultado de la ejecución
   */
  async execute(scriptContent, scriptId, mode = 'headless', deleteAfter = true) {
    const filePath = await this.writeScriptToTemp(scriptContent, scriptId);
    
    try {
      let result;
      
      if (mode === 'visible') {
        result = await this.executeVisible(filePath);
      } else {
        result = await this.executeHeadless(filePath);
      }
      
      result.filePath = filePath;
      result.hostName = os.hostname();
      result.hostIp = this.getLocalIP();
      
      return result;
    } finally {
      if (deleteAfter) {
        // Esperar un poco antes de eliminar para asegurar que el proceso terminó
        setTimeout(() => {
          this.deleteScriptFile(filePath);
        }, 2000);
      }
    }
  }

  /**
   * Obtiene la IP local de la máquina
   * @returns {string}
   */
  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  /**
   * Valida que PowerShell está disponible
   * @returns {Promise<boolean>}
   */
  async validatePowerShell() {
    return new Promise((resolve) => {
      exec('powershell.exe -Command "Write-Output test"', (error, stdout) => {
        if (error) {
          logger.error('PowerShell no está disponible en el sistema');
          resolve(false);
        } else {
          resolve(stdout.trim() === 'test');
        }
      });
    });
  }
}

module.exports = PowerShellHelper;
