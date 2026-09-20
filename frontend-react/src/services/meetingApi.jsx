import api from "./apiClient";

export const getMeeting = () => {
    return api.get(`api/v1/meeting/`)
}