import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ScriptsListDebug() {
  const [scripts, setScripts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, step: 'Iniciando petición...' }));
      
      const token = localStorage.getItem('accessToken');
      setDebugInfo(prev => ({ ...prev, hasToken: !!token, tokenPreview: token?.substring(0, 30) + '...' }));

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      setDebugInfo(prev => ({ ...prev, apiUrl: API_URL }));

      const response = await fetch(`${API_URL}/scripts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setDebugInfo(prev => ({ ...prev, status: response.status, statusText: response.statusText }));

      const data = await response.json();
      setDebugInfo(prev => ({ ...prev, responseData: data }));

      if (data.success && data.data) {
        setScripts(data.data);
        setDebugInfo(prev => ({ ...prev, scriptsCount: data.data.length }));
      } else {
        throw new Error('Respuesta sin datos: ' + JSON.stringify(data));
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setDebugInfo(prev => ({ ...prev, error: err.message, errorStack: err.stack }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug - Scripts List</h1>

      {/* Debug Info */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📊 Debug Info</h2>
        <div className="space-y-2 font-mono text-sm">
          <div><strong>Usuario:</strong> {user?.username || 'N/A'} (Role: {user?.role?.name || 'N/A'})</div>
          <div><strong>Loading:</strong> {loading ? '⏳ Sí' : '✅ No'}</div>
          <div><strong>Scripts Count:</strong> {scripts.length}</div>
          <div><strong>Error:</strong> {error || 'Ninguno'}</div>
          <hr className="my-3" />
          <details>
            <summary className="cursor-pointer font-bold">Ver Debug Info Completo</summary>
            <pre className="mt-2 bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Cargando scripts...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scripts */}
      {!loading && !error && scripts.length === 0 && (
        <div className="bg-gray-100 text-center py-12 rounded-lg">
          <p className="text-gray-600 text-xl">⚠️ No se encontraron scripts</p>
          <p className="text-gray-500 mt-2">La API respondió pero sin datos</p>
        </div>
      )}

      {!loading && scripts.length > 0 && (
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ✅ <strong>{scripts.length} scripts encontrados</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <div key={script.id} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{script.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {script.description || 'Sin descripción'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {script.id}</span>
                  <span>V{script.version}</span>
                  <span>{script.isEnabled ? '✅' : '❌'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
