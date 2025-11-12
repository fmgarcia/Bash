import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { scriptListsAPI } from '../services/api';
import { FaArrowLeft, FaTrash, FaPlay, FaBuilding } from 'react-icons/fa';

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadList();
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const loadList = async () => {
    try {
      const response = await scriptListsAPI.getById(id);
      setList(response.data);
    } catch (error) {
      console.error('Error cargando lista:', error);
      alert('Error cargando la lista');
      navigate('/my-lists');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScript = async (scriptId, scriptName) => {
    if (!window.confirm(`¿Eliminar "${scriptName}" de esta lista?`)) return;

    try {
      await scriptListsAPI.removeScript(id, scriptId);
      loadList();
    } catch (error) {
      alert('Error eliminando script: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando lista...</p>
          </div>
        </main>
      </>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-lists')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Volver a Mis Listas
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: list.color || '#3B82F6' }}
            />
            <h1 className="text-3xl font-bold">{list.name}</h1>
            {list.isDefault && (
              <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">
                Predeterminada
              </span>
            )}
            {currentUser && list.owner && list.owner.id !== currentUser.id && (
              <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded flex items-center gap-2">
                <FaBuilding />
                Lista de {list.owner.fullName || list.owner.username}
              </span>
            )}
          </div>

          {list.description && (
            <p className="text-gray-600 ml-10">{list.description}</p>
          )}
        </div>

        {/* Información adicional */}
        {currentUser && list.owner && list.owner.id !== currentUser.id && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-purple-800 flex items-center gap-2">
              <FaBuilding />
              <strong>Lista compartida de la empresa</strong> - Solo lectura. No puedes modificar esta lista.
            </p>
          </div>
        )}

        {/* Scripts en la lista */}
        {!list.items || list.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">Esta lista está vacía</p>
            <p className="text-gray-500 mt-2">
              Puedes añadir scripts desde la página de scripts usando el icono de corazón
            </p>
            <Link
              to="/scripts"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Scripts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{item.script.name}</h3>
                    {!item.script.isEnabled && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Deshabilitado
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.script.description || 'Sin descripción'}
                  </p>

                  {item.script.tags && (
                    <div className="mb-4">
                      {item.script.tags.split(',').map((tag, idx) => (
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
                    <p>Intérprete: <span className="font-medium">{item.script.interpreter}</span></p>
                    <p>Ejecuciones: {item.script.executionCount}</p>
                    <p className="text-xs mt-1">
                      Añadido: {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {item.notes && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="text-gray-700">{item.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/scripts/${item.script.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded flex items-center justify-center gap-2"
                    >
                      <FaPlay size={12} />
                      Ejecutar
                    </Link>
                    {currentUser && list.owner && list.owner.id === currentUser.id && (
                      <button
                        onClick={() => handleRemoveScript(item.script.id, item.script.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        title="Eliminar de esta lista"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
