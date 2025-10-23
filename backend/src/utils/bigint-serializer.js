/**
 * Convierte BigInt a String recursivamente en objetos y arrays
 * También convierte Decimal de Prisma a Number
 * Esto soluciona el error "Do not know how to serialize a BigInt"
 * @param {*} obj - Objeto a convertir
 * @returns {*} - Objeto con BigInts convertidos a String y Decimals a Number
 */
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si es un BigInt, convertir a String
  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Si es un objeto Decimal de Prisma, convertir a Number
  if (obj && obj.constructor && obj.constructor.name === 'Decimal') {
    return parseFloat(obj.toString());
  }

  // Si es un array, procesar cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToString(item));
  }

  // Si es un objeto Date, mantenerlo como está
  if (obj instanceof Date) {
    return obj;
  }

  // Si es un objeto, procesar cada propiedad
  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToString(obj[key]);
      }
    }
    return converted;
  }

  // Para otros tipos (string, number, boolean), devolver como está
  return obj;
}

module.exports = { convertBigIntToString };
