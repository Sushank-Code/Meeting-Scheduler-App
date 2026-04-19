import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_API;
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axios.interceptors.request.use(
    (config) => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            config.headers.Authorization = `JWT ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const googleAuth = () => {
    return api.get(`auth/o/google-oauth2/?redirect_uri=http://127.0.0.1:8000/auth/o/google-oauth2/`)
}
