import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_API;
const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const authToken = localStorage.getItem('access_token');
        if (authToken) {
            config.headers.Authorization = `JWT ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const redirect_uri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
export const googleAuth = () => {
    return api.get(`auth/o/google-oauth2/?redirect_uri=${encodeURIComponent(redirect_uri)}`)
}

export const googleAuthorization = ({ code, state }) => {
    return api.post(`auth/o/google-oauth2/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirect_uri)}`)
}

export const getUserProfile = () => {
    return api.get(`auth/users/me/`)
}