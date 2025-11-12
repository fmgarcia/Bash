import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ScriptListsModal from '../components/ScriptListsModal';
import { scriptsAPI } from '../services/api';
import { FaHeart } from 'react-icons/fa';

export default function ScriptsList() {
  const [scripts, setScripts] = useState([]);
  const [filters, setFilters] = useState({ search: '', page: 1, interpreter: '' });
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState(null);
  const [showListsModal, setShowListsModal] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadScripts();
  }, [filters]);

  const loadScripts = async () => {
    try {
      // Filtrar parámetros vacíos antes de enviar
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await scriptsAPI.getAll(cleanFilters);
      setScripts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error cargando scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, search: query, page: 1 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este script?')) return;

    try {
      await scriptsAPI.delete(id);
      loadScripts();
    } catch (error) {
      alert('Error eliminando script: ' + (error.response?.data?.message || error.message));
    }
  };

  const openListsModal = (script) => {
    setSelectedScript(script);
    setShowListsModal(true);
  };

  const closeListsModal = (saved) => {
    setShowListsModal(false);
    setSelectedScript(null);
    if (saved) {
      // Recargar scripts para actualizar los iconos de corazón
      loadScripts();
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Scripts PowerShell</h1>
          {isAdmin() && (
            <Link
              to="/admin/scripts/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              + Nuevo Script
            </Link>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <SearchBar onSearch={handleSearch} placeholder="Buscar por nombre, descripción o tags..." />
          
          {/* Filtro por intérprete */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Intérprete:</label>
            <select
              value={filters.interpreter}
              onChange={(e) => setFilters({ ...filters, interpreter: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="powershell">PowerShell</option>
              <option value="bash">Bash</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cmd">CMD</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando scripts...</div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron scripts
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scripts.map((script) => (
                <div key={script.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold">{script.name}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openListsModal(script)}
                          className={`transition-colors p-1 ${
                            script.scriptListItems && script.scriptListItems.length > 0
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                          title={
                            script.scriptListItems && script.scriptListItems.length > 0
                              ? `En ${script.scriptListItems.length} lista(s)`
                              : 'Añadir a listas'
                          }
                        >
                          <FaHeart size={20} />
                        </button>
                        {!script.isEnabled && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Deshabilitado
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {script.description || 'Sin descripción'}
                    </p>

                    {script.tags && (
                      <div className="mb-4">
                        {script.tags.split(',').map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-2"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      <p>Intérprete: <span className="font-medium">{script.interpreter}</span></p>
                      <p>Version: {script.version}</p>
                      <p>Ejecuciones: {script.executionCount}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/scripts/${script.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded"
                      >
                        Ver Detalle
                      </Link>
                      {isAdmin() && (
                        <>
                          <Link
                            to={`/admin/scripts/${script.id}/edit`}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(script.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`px-4 py-2 rounded ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de listas */}
      {selectedScript && (
        <ScriptListsModal
          isOpen={showListsModal}
          onClose={closeListsModal}
          scriptId={selectedScript.id}
          scriptName={selectedScript.name}
        />
      )}
    </>
  );
}
