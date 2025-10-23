import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { usersAPI } from '../../services/api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleId: 2,
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
      } else {
        await usersAPI.create(formData);
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleId: 2,
        isActive: true
      });
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      password: '',
      fullName: user.fullName || '',
      roleId: user.roleId,
      isActive: user.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (error) {
      alert('Error eliminando usuario');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Cargando usuarios...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingUser(null);
              setFormData({
                username: '',
                email: '',
                password: '',
                fullName: '',
                roleId: 2,
                isActive: true
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            + Nuevo Usuario
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Contraseña {editingUser ? '' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Rol</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>User</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 mr-3"
                />
                <label className="text-gray-700 font-semibold">Usuario activo</label>
              </div>

              <div className="col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.fullName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role.name === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
