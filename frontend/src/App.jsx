import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScriptsList from './pages/ScriptsList';
import ScriptsListDebug from './pages/ScriptsListDebug';
import ScriptDetail from './pages/ScriptDetail';
import ScriptForm from './pages/Admin/ScriptForm';
import UsersList from './pages/Admin/UsersList';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return isAdmin() ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/scripts"
        element={
          <PrivateRoute>
            <ScriptsList />
          </PrivateRoute>
        }
      />

      <Route
        path="/scripts-debug"
        element={
          <PrivateRoute>
            <ScriptsListDebug />
          </PrivateRoute>
        }
      />

      <Route
        path="/scripts/:id"
        element={
          <PrivateRoute>
            <ScriptDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/scripts/new"
        element={
          <AdminRoute>
            <ScriptForm />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/scripts/:id/edit"
        element={
          <AdminRoute>
            <ScriptForm />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersList />
          </AdminRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
