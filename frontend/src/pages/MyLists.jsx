import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { scriptListsAPI } from '../services/api';
import { FaHeart, FaPlus, FaTrash, FaEdit, FaList, FaBuilding } from 'react-icons/fa';

export default function MyLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLists();
    loadCurrentUser();
  }, []);

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

  const loadLists = async () => {
    try {
      const response = await scriptListsAPI.getAll();
      setLists(response.data);
    } catch (error) {
      console.error('Error cargando listas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListData.name.trim()) {
      alert('El nombre de la lista es obligatorio');
      return;
    }

    try {
      await scriptListsAPI.create(newListData);
      setNewListData({ name: '', description: '', color: '#3B82F6' });
      setShowNewListForm(false);
      loadLists();
    } catch (error) {
      alert('Error creando lista: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`¿Eliminar la lista "${listName}"?`)) return;

    try {
      await scriptListsAPI.delete(listId);
      loadLists();
    } catch (error) {
      alert('Error eliminando lista: ' + (error.response?.data?.message || error.message));
    }
  };

  const viewListDetail = (listId) => {
    navigate(`/my-lists/${listId}`);
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mis Listas de Scripts</h1>
            <p className="text-gray-600 mt-1">Organiza tus scripts en listas personalizadas</p>
          </div>
          <button
            onClick={() => setShowNewListForm(!showNewListForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus />
            Nueva Lista
          </button>
        </div>

        {/* Formulario para crear nueva lista */}
        {showNewListForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Crear Nueva Lista</h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la lista *
                </label>
                <input
                  type="text"
                  value={newListData.name}
                  onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Scripts de backup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newListData.description}
                  onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción de la lista"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListData({ ...newListData, color })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        newListData.color === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Lista
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewListForm(false);
                    setNewListData({ name: '', description: '', color: '#3B82F6' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando listas...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaList className="mx-auto text-gray-400 text-6xl mb-4" />
            <p className="text-gray-600 text-lg">No tienes listas creadas</p>
            <p className="text-gray-500 mt-2">Crea tu primera lista para organizar tus scripts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const isOwnList = currentUser && list.owner && list.owner.id === currentUser.id;
              const isCompanyList = currentUser && list.owner && list.owner.id !== currentUser.id;
              
              return (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => viewListDetail(list.id)}
              >
                <div className="h-2" style={{ backgroundColor: list.color || '#3B82F6' }} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaHeart className="text-gray-400" />
                      <h3 className="text-xl font-bold">{list.name}</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      {list.isDefault && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Predeterminada
                        </span>
                      )}
                      {isCompanyList && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <FaBuilding className="text-xs" />
                          Empresa
                        </span>
                      )}
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  {isCompanyList && list.owner && (
                    <p className="text-sm text-purple-600 mb-2 flex items-center gap-1">
                      <FaBuilding className="text-xs" />
                      {list.owner.fullName || list.owner.username}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{list._count?.items || 0} scripts</span>
                    <span className="text-xs">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!list.isDefault && isOwnList && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar edición
                        }}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded flex items-center justify-center gap-2"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id, list.name);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </main>
    </>
  );
}
