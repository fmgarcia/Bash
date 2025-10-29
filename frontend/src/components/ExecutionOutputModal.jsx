import { useState, useEffect } from 'react';
import { executionsAPI } from '../services/api';

export default function ExecutionOutputModal({ isOpen, onClose, execution }) {
  const [comentarios, setComentarios] = useState(execution?.comments || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  // Actualizar comentarios cuando cambie la ejecución
  useEffect(() => {
    if (execution) {
      setComentarios(execution.comments || '');
      setUpdateMessage(null);
    }
  }, [execution]);

  if (!isOpen || !execution) return null;

  const handleUpdateComentarios = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);
    
    try {
      await executionsAPI.updateComentarios(execution.id, comentarios);
      setUpdateMessage({ type: 'success', text: 'Comentarios actualizados correctamente' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar comentarios:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al actualizar comentarios' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadLog = () => {
    // Formatear fecha correctamente
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch {
        return 'N/A';
      }
    };

    const content = `
=== EJECUCIÓN DE SCRIPT ===
Script: ${execution.script?.name}
Fecha: ${formatDate(execution.startedAt)}
Duración: ${execution.durationSeconds}s
Exit Code: ${execution.exitCode}
Éxito: ${execution.success ? 'Sí' : 'No'}

=== STDOUT ===
${execution.stdout || 'Sin salida'}

=== STDERR ===
${execution.stderr || 'Sin errores'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution_${execution.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-bold">
            Resultado de Ejecución #{execution.id}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none">
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Script</p>
              <p className="font-semibold text-sm sm:text-base break-words">{execution.script?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Fecha</p>
              <p className="font-semibold text-sm sm:text-base">
                {execution.startedAt 
                  ? new Date(execution.startedAt).toLocaleString('es-ES')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Duración</p>
              <p className="font-semibold text-sm sm:text-base">
                {typeof execution.durationSeconds === 'number' 
                  ? `${execution.durationSeconds}s`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Exit Code</p>
              <p className={`font-semibold text-sm sm:text-base ${execution.exitCode === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {typeof execution.exitCode === 'number' ? execution.exitCode : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Estado</p>
              <span className={`inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold ${
                execution.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {execution.success ? 'Exitoso' : 'Fallido'}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-sm sm:text-base mb-2">Salida Estándar (stdout):</h3>
            <pre className="bg-gray-100 p-3 sm:p-4 rounded max-h-48 sm:max-h-64 overflow-auto text-xs sm:text-sm">
              {execution.stdout || 'Sin salida'}
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base mb-2">Errores (stderr):</h3>
            <pre className="bg-red-50 p-3 sm:p-4 rounded max-h-48 sm:max-h-64 overflow-auto text-xs sm:text-sm">
              {execution.stderr || 'Sin errores'}
            </pre>
          </div>

          <div className="mt-4">
            <h3 className="font-bold text-sm sm:text-base mb-2">Comentarios:</h3>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Escribe tus comentarios sobre esta ejecución..."
              className="w-full p-3 border border-gray-300 rounded text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            {updateMessage && (
              <div className={`mt-2 p-2 rounded text-xs sm:text-sm ${
                updateMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {updateMessage.text}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <button
            onClick={handleUpdateComentarios}
            disabled={isUpdating}
            className={`w-full sm:w-auto px-4 py-2 rounded text-sm sm:text-base font-semibold ${
              isUpdating 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isUpdating ? '💾 Guardando...' : '💾 Actualizar Comentarios'}
          </button>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={downloadLog}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm sm:text-base"
            >
              📥 Descargar Log
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm sm:text-base"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
