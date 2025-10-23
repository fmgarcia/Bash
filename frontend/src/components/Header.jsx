import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold">
            🔷 Gestión Scripts
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/scripts" className="hover:underline">
              Scripts
            </Link>
            {isAdmin() && (
              <>
                <Link to="/admin/scripts/new" className="hover:underline">
                  Nuevo Script
                </Link>
                <Link to="/admin/users" className="hover:underline">
                  Usuarios
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.fullName || user?.username}
              <span className="ml-2 text-xs bg-blue-800 px-2 py-1 rounded">
                {user?.role?.name}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
