import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import ExecutionOutputModal from '../components/ExecutionOutputModal';
import { scriptsAPI } from '../services/api';

export default function ScriptDetail() {
  const { id } = useParams();
  const [script, setScript] = useState(null);
  const [parameters, setParameters] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [execution, setExecution] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executionMode, setExecutionMode] = useState('headless'); // 'visible' o 'headless'

  useEffect(() => {
    loadScript();
  }, [id]);

  const loadScript = async () => {
    try {
      const response = await scriptsAPI.getById(id);
      const scriptData = response.data.data;
      setScript(scriptData);

      // Inicializar parámetros
      if (scriptData.parametersSchema) {
        const schema = JSON.parse(scriptData.parametersSchema);
        const initialParams = {};
        Object.keys(schema).forEach((key) => {
          initialParams[key] = schema[key].default || '';
        });
        setParameters(initialParams);
      }
    } catch (error) {
      console.error('Error cargando script:', error);
      alert('Error cargando script');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = () => {
    setShowConfirm(true);
  };

  const confirmExecute = async () => {
    setShowConfirm(false);
    setExecuting(true);

    try {
      const response = await scriptsAPI.execute(id, parameters, executionMode);
      setExecution(response.data.data);
      setShowOutput(true);
    } catch (error) {
      alert('Error ejecutando script: ' + (error.response?.data?.message || error.message));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Cargando script...</div>
        </div>
      </>
    );
  }

  if (!script) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Script no encontrado</div>
        </div>
      </>
    );
  }

  const schema = script.parametersSchema ? JSON.parse(script.parametersSchema) : {};

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{script.name}</h1>
            <p className="text-gray-600">{script.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-semibold">{script.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interpreter</p>
              <p className="font-semibold">{script.interpreter}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ejecuciones</p>
              <p className="font-semibold">{script.executionCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última ejecución</p>
              <p className="font-semibold">
                {script.lastExecutedAt
                  ? new Date(script.lastExecutedAt).toLocaleDateString()
                  : 'Nunca'}
              </p>
            </div>
          </div>

          {script.tags && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Tags:</p>
              {script.tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded mr-2 mb-2"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Código del Script</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto max-h-96 text-sm">
              {script.body}
            </pre>
          </div>

          {Object.keys(schema).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Parámetros</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schema).map(([key, config]) => (
                  <div key={key}>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {key}
                      {config.required && <span className="text-red-500"> *</span>}
                    </label>
                    {config.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={parameters[key] || false}
                        onChange={(e) =>
                          setParameters({ ...parameters, [key]: e.target.checked })
                        }
                        className="w-5 h-5"
                      />
                    ) : (
                      <input
                        type={config.type === 'number' || config.type === 'integer' ? 'number' : 'text'}
                        value={parameters[key] || ''}
                        onChange={(e) =>
                          setParameters({ ...parameters, [key]: e.target.value })
                        }
                        placeholder={config.description || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    {config.description && (
                      <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center cursor-pointer">
              <span className="text-gray-700 font-semibold mr-4">Modo de Ejecución:</span>
              <div className="flex items-center">
                <span className={`mr-3 text-sm ${executionMode === 'headless' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  🔇 Oculto
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={executionMode === 'visible'}
                    onChange={(e) => setExecutionMode(e.target.checked ? 'visible' : 'headless')}
                    className="sr-only peer"
                    disabled={executing}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className={`ml-3 text-sm ${executionMode === 'visible' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  👁️ Visible
                </span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-36">
              {executionMode === 'visible' 
                ? '💡 Se abrirá una ventana de PowerShell durante la ejecución' 
                : '💡 El script se ejecutará en segundo plano sin mostrar ventana'}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleExecute}
              disabled={executing || !script.isEnabled}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded disabled:bg-gray-400"
            >
              {executing ? '⏳ Ejecutando...' : '▶️ Ejecutar Script'}
            </button>
            {!script.isEnabled && (
              <span className="text-red-600 py-3">
                Este script está deshabilitado
              </span>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmExecute}
        title="Confirmar Ejecución"
        message={`¿Estás seguro de ejecutar "${script.name}" en tu máquina local? Esta acción ejecutará PowerShell en el servidor.`}
        confirmText="Sí, Ejecutar"
      />

      <ExecutionOutputModal
        isOpen={showOutput}
        onClose={() => setShowOutput(false)}
        execution={execution}
      />
    </>
  );
}
