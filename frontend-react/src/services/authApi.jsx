import api from "./apiClient";

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
