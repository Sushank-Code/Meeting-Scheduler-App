import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_API;
const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor 
api.interceptors.request.use(
    (config) => {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            config.headers.Authorization = `JWT ${access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor 
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh_token = localStorage.getItem('refresh_token');
                if (!refresh_token) {
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.href = '/'
                    return Promise.reject(error)
                }
                const response = await api.post('auth/jwt/refresh/', { refresh: refresh_token });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `JWT ${response.data.access}`;
                return api(originalRequest);
            } catch {
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = '/'
            }
        }
        return Promise.reject(error);
    }
);

export default api;
