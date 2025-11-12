import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords)
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats')
};

// Scripts
export const scriptsAPI = {
  getAll: (params) => api.get('/scripts', { params }),
  getById: (id) => api.get(`/scripts/${id}`),
  create: (scriptData) => api.post('/scripts', scriptData),
  update: (id, scriptData) => api.put(`/scripts/${id}`, scriptData),
  delete: (id) => api.delete(`/scripts/${id}`),
  getVersions: (id) => api.get(`/scripts/${id}/versions`),
  execute: (id, parameters, mode = 'visible') => api.post(`/scripts/${id}/execute`, { parameters, mode }),
  getStats: () => api.get('/scripts/stats')
};

// Executions
export const executionsAPI = {
  getAll: (params) => api.get('/executions', { params }),
  getById: (id) => api.get(`/executions/${id}`),
  getStats: (params) => api.get('/executions/stats', { params }),
  updateComentarios: (id, comentarios) => api.patch(`/executions/${id}/comentarios`, { comentarios })
};

// Audit
export const auditAPI = {
  getTrail: (params) => api.get('/audit', { params })
};

// Script Lists
export const scriptListsAPI = {
  getAll: () => api.get('/script-lists'),
  getById: (id) => api.get(`/script-lists/${id}`),
  create: (listData) => api.post('/script-lists', listData),
  update: (id, listData) => api.patch(`/script-lists/${id}`, listData),
  delete: (id) => api.delete(`/script-lists/${id}`),
  addScript: (listId, scriptId, notes) => api.post(`/script-lists/${listId}/scripts`, { scriptId, notes }),
  removeScript: (listId, scriptId) => api.delete(`/script-lists/${listId}/scripts/${scriptId}`),
  getScriptLists: (scriptId) => api.get(`/script-lists/scripts/${scriptId}/lists`),
  updateScriptLists: (scriptId, listIds) => api.put(`/script-lists/scripts/${scriptId}/lists`, { listIds })
};

export default api;
