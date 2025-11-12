import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { FaUser, FaClock } from 'react-icons/fa';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Cargar usuarios recientes del localStorage
    const recent = localStorage.getItem('recentUsers');
    if (recent) {
      try {
        setRecentUsers(JSON.parse(recent));
      } catch (e) {
        console.error('Error cargando usuarios recientes:', e);
      }
    }
  }, []);

  const saveRecentUser = (username) => {
    let recent = [...recentUsers];
    
    // Eliminar el usuario si ya existe
    recent = recent.filter(u => u !== username);
    
    // Agregar al principio
    recent.unshift(username);
    
    // Mantener solo los últimos 5
    recent = recent.slice(0, 5);
    
    localStorage.setItem('recentUsers', JSON.stringify(recent));
    setRecentUsers(recent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      saveRecentUser(credentials.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const selectRecentUser = (username) => {
    setCredentials({ ...credentials, username });
    setShowRecent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔷 {t('login.title')}
          </h1>
          <p className="text-gray-600">PowerShell Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center justify-between">
              <span>{t('login.username')}</span>
              {recentUsers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecent(!showRecent)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaClock size={12} />
                  {t('login.recentUsers')}
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                onFocus={() => setShowRecent(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus
              />
              
              {/* Dropdown de usuarios recientes */}
              {showRecent && recentUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {recentUsers.map((username, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectRecentUser(username)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 transition"
                    >
                      <FaUser className="text-gray-400" size={12} />
                      <span className="text-gray-700">{username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
          >
            {loading ? `${t('common.loading')}` : t('login.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Aplicación de gestión local de scripts PowerShell</p>
        </div>
      </div>
    </div>
  );
}
