import { useState, useEffect } from 'react';
import { scriptListsAPI } from '../services/api';
import { FaHeart, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';

const ScriptListsModal = ({ isOpen, onClose, scriptId, scriptName }) => {
  const [lists, setLists] = useState([]);
  const [scriptLists, setScriptLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState('#3B82F6');

  useEffect(() => {
    if (isOpen && scriptId) {
      loadData();
    }
  }, [isOpen, scriptId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listsResponse, scriptListsResponse] = await Promise.all([
        scriptListsAPI.getAll(),
        scriptListsAPI.getScriptLists(scriptId)
      ]);

      setLists(listsResponse.data);
      setScriptLists(scriptListsResponse.data.map(l => l.id));
    } catch (err) {
      setError('Error cargando las listas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleList = (listId) => {
    setScriptLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await scriptListsAPI.updateScriptLists(scriptId, scriptLists);
      onClose(true); // Cerrar y notificar que se guardaron cambios
    } catch (err) {
      setError('Error guardando las listas');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setError('El nombre de la lista es obligatorio');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await scriptListsAPI.create({
        name: newListName,
        description: newListDescription,
        color: newListColor
      });

      const newList = response.data;
      setLists(prev => [...prev, newList]);
      setScriptLists(prev => [...prev, newList.id]);
      
      setShowNewList(false);
      setNewListName('');
      setNewListDescription('');
      setNewListColor('#3B82F6');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creando la lista');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FaHeart className="text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Añadir a listas
            </h2>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Script Name */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">Script:</p>
          <p className="font-medium text-gray-900 truncate">{scriptName}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Lista de listas */}
              <div className="space-y-2 mb-4">
                {lists.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tienes listas creadas
                  </p>
                ) : (
                  lists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => toggleList(list.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        scriptLists.includes(list.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: list.color || '#3B82F6' }}
                        />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {list.name}
                            {list.isDefault && (
                              <span className="ml-2 text-xs text-gray-500">(Predeterminada)</span>
                            )}
                          </p>
                          {list.description && (
                            <p className="text-sm text-gray-500 truncate">{list.description}</p>
                          )}
                        </div>
                      </div>
                      {scriptLists.includes(list.id) && (
                        <FaCheck className="text-blue-500" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Botón para crear nueva lista */}
              {!showNewList ? (
                <button
                  onClick={() => setShowNewList(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <FaPlus />
                  <span>Crear nueva lista</span>
                </button>
              ) : (
                <div className="border-2 border-blue-500 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la lista *
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Mis scripts favoritos"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descripción de la lista"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewListColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newListColor === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateList}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Creando...' : 'Crear'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewList(false);
                        setNewListName('');
                        setNewListDescription('');
                        setNewListColor('#3B82F6');
                        setError('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={() => onClose(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptListsModal;
