import api from "./apiClient";

export const getMeeting = () => {
    return api.get(`api/v1/meeting/`)
}

export const createMeeting = () => {
    return api.post()
}