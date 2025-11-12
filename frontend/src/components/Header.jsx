import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { user, logout, isAdmin, isEmpresa } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              {t('header.dashboard')}
            </Link>
            <Link to="/scripts" className="hover:underline">
              {t('header.scripts')}
            </Link>
            <Link to="/my-lists" className="hover:underline">
              {t('header.myLists')}
            </Link>
            {isAdmin() && (
              <>
                <Link to="/admin/scripts/new" className="hover:underline">
                  {t('scripts.newScript')}
                </Link>
                <Link to="/admin/users" className="hover:underline">
                  {t('header.users')}
                </Link>
              </>
            )}
            {isEmpresa() && (
              <Link to="/empresa/users" className="hover:underline">
                {t('header.myUsers')}
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
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
              {t('header.logout')}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
