const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const logger = require('./logger');

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
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Escapar la ruta del archivo para PowerShell
      const escapedPath = filePath.replace(/\\/g, '\\\\');
      
      // Comando para abrir PowerShell visible
      const psCommand = `Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${escapedPath}"' -WindowStyle Normal`;
      
      logger.info(`Ejecutando script en modo VISIBLE: ${filePath}`);
      
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command', psCommand
      ], {
        windowsHide: false,
        detached: false
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        logger.error(`Error ejecutando script: ${error.message}`);
        reject(error);
      });

      child.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(3);
        
        logger.info(`Script finalizado con código ${code} en ${duration}s`);
        
        resolve({
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          duration: parseFloat(duration),
          success: code === 0,
          mode: 'visible'
        });
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
      
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', filePath
      ], {
        windowsHide: true,
        shell: false
      });

      let stdout = '';
      let stderr = '';

      // Timeout
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        logger.warn(`Script terminado por timeout después de ${timeout}ms`);
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        logger.error(`Error ejecutando script: ${error.message}`);
        reject(error);
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const duration = ((Date.now() - startTime) / 1000).toFixed(3);
        
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
