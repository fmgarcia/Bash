export default function ExecutionOutputModal({ isOpen, onClose, execution }) {
  if (!isOpen || !execution) return null;

  const downloadLog = () => {
    const content = `
=== EJECUCIÓN DE SCRIPT ===
Script: ${execution.script?.name}
Fecha: ${new Date(execution.startedAt).toLocaleString()}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Resultado de Ejecución #{execution.id}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Script</p>
              <p className="font-semibold">{execution.script?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="font-semibold">{new Date(execution.startedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duración</p>
              <p className="font-semibold">{execution.durationSeconds}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Exit Code</p>
              <p className={`font-semibold ${execution.exitCode === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {execution.exitCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                execution.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {execution.success ? 'Exitoso' : 'Fallido'}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Salida Estándar (stdout):</h3>
            <pre className="bg-gray-100 p-4 rounded max-h-64 overflow-auto text-sm">
              {execution.stdout || 'Sin salida'}
            </pre>
          </div>

          <div>
            <h3 className="font-bold mb-2">Errores (stderr):</h3>
            <pre className="bg-red-50 p-4 rounded max-h-64 overflow-auto text-sm">
              {execution.stderr || 'Sin errores'}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            onClick={downloadLog}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            📥 Descargar Log
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
