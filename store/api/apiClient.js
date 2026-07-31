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
      const sessionType = localStorage.getItem('sessionType') || sessionStorage.getItem('sessionType');
      const isAdminRoute =
        config.url?.includes('/admin') ||
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/portal');

      const preferredKey = (sessionType === 'admin' || isAdminRoute) ? 'adminAccessToken' : 'userAccessToken';
      let token = localStorage.getItem(preferredKey);

      // Fallback: if preferred token missing, check alternative
      if (!token) {
        token = localStorage.getItem('adminAccessToken') || localStorage.getItem('userAccessToken');
      }

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
    const isAuthEndpoint =
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/refresh') ||
      originalRequest.url?.includes('/register');

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const sessionType = typeof window !== 'undefined'
        ? (localStorage.getItem('sessionType') || sessionStorage.getItem('sessionType'))
        : null;

      const isSystemAdmin =
        sessionType === 'admin' ||
        originalRequest.url?.includes('/admin') ||
        (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/portal')));

      const accessKey = isSystemAdmin ? 'adminAccessToken' : 'userAccessToken';
      const refreshKey = isSystemAdmin ? 'adminRefreshToken' : 'userRefreshToken';
      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem(refreshKey) : null;

      try {
        const refreshEndpoint = isSystemAdmin ? '/admin-auth/refresh' : '/auth/refresh';
        const res = await axios.post(
          `${apiClient.defaults.baseURL}${refreshEndpoint}`,
          { refreshToken: storedRefreshToken || undefined },
          { withCredentials: true }
        );

        const payload = res.data?.data || res.data;
        const newToken = payload?.accessToken;
        const newRefreshToken = payload?.refreshToken;

        if (newToken) {
          localStorage.setItem(accessKey, newToken);
          if (newRefreshToken) {
            localStorage.setItem(refreshKey, newRefreshToken);
          }
          if (isSystemAdmin) {
            localStorage.setItem('sessionType', 'admin');
            sessionStorage.setItem('sessionType', 'admin');
          } else {
            localStorage.setItem('sessionType', 'user');
            sessionStorage.setItem('sessionType', 'user');
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem('userAccessToken');
        localStorage.removeItem('userRefreshToken');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('sessionType');
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
