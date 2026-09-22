import api from "./apiClient";

export const getMeeting = () => {
    return api.get(`api/v1/meeting/`)
}

export const createMeeting = (body) => {
    return api.post(`api/v1/meeting/`, body)
}