import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { scriptsAPI, executionsAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ scripts: {}, executions: {} });
  const [recentScripts, setRecentScripts] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [scriptsStatsRes, execStatsRes, scriptsRes, execRes] = await Promise.all([
        scriptsAPI.getStats(),
        executionsAPI.getStats({ days: 7 }),
        scriptsAPI.getAll({ limit: 5 }),
        executionsAPI.getAll({ limit: 5 })
      ]);

      setStats({
        scripts: scriptsStatsRes.data.data,
        executions: execStatsRes.data.data
      });
      setRecentScripts(scriptsRes.data.data);
      setRecentExecutions(execRes.data.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Cargando dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 p-6 rounded-lg">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Total Scripts</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.scripts.total || 0}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Scripts Activos</h3>
            <p className="text-3xl font-bold text-green-600">{stats.scripts.enabled || 0}</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Ejecuciones (7d)</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.executions.total || 0}</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Tasa Éxito</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.executions.successRate || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scripts Recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Scripts Recientes</h2>
              <Link to="/scripts" className="text-blue-600 hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {recentScripts.length > 0 ? (
                recentScripts.map((script) => (
                  <Link
                    key={script.id}
                    to={`/scripts/${script.id}`}
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    <h3 className="font-semibold">{script.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{script.description}</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">No hay scripts disponibles</p>
              )}
            </div>
          </div>

          {/* Ejecuciones Recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Ejecuciones Recientes</h2>
            <div className="space-y-3">
              {recentExecutions.length > 0 ? (
                recentExecutions.map((exec) => (
                  <div key={exec.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exec.script?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(exec.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          exec.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {exec.success ? '✓ Éxito' : '✗ Fallo'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay ejecuciones recientes</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
