import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const sessionType = sessionStorage.getItem('sessionType');
      const token = localStorage.getItem(sessionType === 'admin' ? 'adminAccessToken' : 'userAccessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh & unwrap envelope
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Token expired — try refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const isSystemAdmin = typeof window !== 'undefined' && sessionStorage.getItem('sessionType') === 'admin';
      try {
        const refreshEndpoint = isSystemAdmin ? '/admin-auth/refresh' : '/auth/refresh';
        const res = await axios.post(
          `${apiClient.defaults.baseURL}${refreshEndpoint}`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.data.accessToken;
        localStorage.setItem(isSystemAdmin ? 'adminAccessToken' : 'userAccessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem(isSystemAdmin ? 'adminAccessToken' : 'userAccessToken');
        sessionStorage.removeItem('sessionType');
        if (typeof window !== 'undefined') {
          window.location.href = isSystemAdmin ? '/portal/k7x9m2p4' : '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || { error: { message: 'Network error' } });
  }
);

export default apiClient;
