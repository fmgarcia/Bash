/**
 * Sanitización de inputs para prevenir inyecciones
 */

/**
 * Sanitiza una cadena eliminando caracteres peligrosos para PowerShell
 * @param {string} input 
 * @returns {string}
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Eliminar caracteres de control y caracteres especiales peligrosos
  // que podrían usarse para inyección de comandos
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Caracteres de control
    .replace(/[;&|`$(){}[\]<>]/g, '') // Caracteres especiales de shell
    .trim();
}

/**
 * Valida y sanitiza parámetros según el schema
 * @param {object} parameters - Parámetros a validar
 * @param {object} schema - Schema de parámetros esperados
 * @returns {object} - Parámetros sanitizados
 * @throws {Error} - Si la validación falla
 */
function validateAndSanitizeParameters(parameters = {}, schema = {}) {
  if (!schema || typeof schema !== 'object') {
    return {};
  }

  const sanitized = {};
  
  // Parsear schema si viene como string JSON
  let parsedSchema = schema;
  if (typeof schema === 'string') {
    try {
      parsedSchema = JSON.parse(schema);
    } catch (error) {
      throw new Error('Schema de parámetros inválido');
    }
  }

  // Validar cada parámetro del schema
  for (const [key, config] of Object.entries(parsedSchema)) {
    const value = parameters[key];
    
    // Verificar si es requerido
    if (config.required && (value === undefined || value === null || value === '')) {
      throw new Error(`El parámetro '${key}' es requerido`);
    }

    // Si no está definido y no es requerido, continuar
    if (value === undefined || value === null) {
      if (config.default !== undefined) {
        sanitized[key] = config.default;
      }
      continue;
    }

    // Validar tipo
    switch (config.type) {
      case 'string':
        sanitized[key] = sanitizeString(value);
        
        // Validar longitud
        if (config.maxLength && sanitized[key].length > config.maxLength) {
          throw new Error(`El parámetro '${key}' excede la longitud máxima de ${config.maxLength}`);
        }
        
        // Validar patrón regex
        if (config.pattern) {
          const regex = new RegExp(config.pattern);
          if (!regex.test(sanitized[key])) {
            throw new Error(`El parámetro '${key}' no cumple el patrón requerido`);
          }
        }
        break;

      case 'number':
      case 'integer':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`El parámetro '${key}' debe ser un número`);
        }
        if (config.type === 'integer' && !Number.isInteger(num)) {
          throw new Error(`El parámetro '${key}' debe ser un número entero`);
        }
        if (config.min !== undefined && num < config.min) {
          throw new Error(`El parámetro '${key}' debe ser mayor o igual a ${config.min}`);
        }
        if (config.max !== undefined && num > config.max) {
          throw new Error(`El parámetro '${key}' debe ser menor o igual a ${config.max}`);
        }
        sanitized[key] = num;
        break;

      case 'boolean':
        sanitized[key] = Boolean(value);
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`El parámetro '${key}' debe ser un array`);
        }
        sanitized[key] = value.map(item => sanitizeString(String(item)));
        break;

      default:
        sanitized[key] = sanitizeString(String(value));
    }
  }

  return sanitized;
}

/**
 * Reemplaza placeholders en el script con valores sanitizados
 * Formato: {{paramName}}
 * @param {string} scriptBody - Cuerpo del script
 * @param {object} parameters - Parámetros sanitizados
 * @returns {string} - Script con parámetros reemplazados
 */
function replacePlaceholders(scriptBody, parameters) {
  let result = scriptBody;
  
  for (const [key, value] of Object.entries(parameters)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    
    // Escapar comillas dobles en el valor para PowerShell
    let escapedValue = String(value).replace(/"/g, '`"');
    
    result = result.replace(placeholder, escapedValue);
  }
  
  // Verificar si quedan placeholders sin reemplazar
  const unreplacedPlaceholders = result.match(/{{[^}]+}}/g);
  if (unreplacedPlaceholders) {
    throw new Error(`Placeholders no reemplazados: ${unreplacedPlaceholders.join(', ')}`);
  }
  
  return result;
}

/**
 * Sanitiza el nombre de archivo para evitar path traversal
 * @param {string} filename 
 * @returns {string}
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255);
}

module.exports = {
  sanitizeString,
  validateAndSanitizeParameters,
  replacePlaceholders,
  sanitizeFilename
};
