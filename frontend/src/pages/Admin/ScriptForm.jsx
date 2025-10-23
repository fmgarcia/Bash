import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { scriptsAPI } from '../../services/api';

export default function ScriptForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    body: '',
    interpreter: 'powershell',
    entryPoint: '',
    parametersSchema: '',
    tags: '',
    isEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadScript();
    }
  }, [id]);

  const loadScript = async () => {
    try {
      const response = await scriptsAPI.getById(id);
      const script = response.data.data;
      setFormData({
        name: script.name,
        description: script.description || '',
        body: script.body,
        interpreter: script.interpreter,
        entryPoint: script.entryPoint || '',
        parametersSchema: script.parametersSchema || '',
        tags: script.tags || '',
        isEnabled: script.isEnabled
      });
    } catch (error) {
      alert('Error cargando script');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validar parametersSchema si existe
      if (formData.parametersSchema) {
        try {
          JSON.parse(formData.parametersSchema);
        } catch {
          setErrors({ parametersSchema: 'JSON inválido' });
          setLoading(false);
          return;
        }
      }

      if (isEdit) {
        await scriptsAPI.update(id, formData);
      } else {
        await scriptsAPI.create(formData);
      }

      navigate('/scripts');
    } catch (error) {
      alert('Error guardando script: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">
            {isEdit ? 'Editar Script' : 'Nuevo Script'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Código del Script *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                rows="15"
                placeholder="Write-Output 'Hola Mundo'"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Interpreter
                </label>
                <select
                  value={formData.interpreter}
                  onChange={(e) => setFormData({ ...formData, interpreter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="powershell">PowerShell</option>
                  <option value="cmd">CMD</option>
                  <option value="bash">Bash</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Entry Point
                </label>
                <input
                  type="text"
                  value={formData.entryPoint}
                  onChange={(e) => setFormData({ ...formData, entryPoint: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="script.ps1"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Parameters Schema (JSON)
              </label>
              <textarea
                value={formData.parametersSchema}
                onChange={(e) => setFormData({ ...formData, parametersSchema: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg font-mono text-sm ${
                  errors.parametersSchema ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="6"
                placeholder='{"userName": {"type": "string", "required": true}, "count": {"type": "number", "default": 10}}'
              />
              {errors.parametersSchema && (
                <p className="text-red-500 text-sm mt-1">{errors.parametersSchema}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tags (separados por coma)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="windows, administración, backup"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="w-5 h-5 mr-3"
              />
              <label className="text-gray-700 font-semibold">
                Script habilitado
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Script'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/scripts')}
                className="bg-gray-300 hover:bg-gray-400 py-3 px-8 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
