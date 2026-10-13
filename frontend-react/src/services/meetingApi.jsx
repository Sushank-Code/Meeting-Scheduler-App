import api from "./apiClient";

export const getMeeting = () => {
    return api.get(`api/v1/meeting/`)
}

export const getSingleMeeting = (id) => {
    return api.get(`api/v1/meeting/${id}/`)
}

export const createMeeting = (body) => {
    return api.post(`api/v1/meeting/`, body)
}

export const updateMeeting = (id, body) => {
    return api.patch(`api/v1/meeting/${id}/`, body)
}

export const deleteMeeting = (id) => {
    return api.delete(`api/v1/meeting/${id}/`)
}

export const cancelMeetingApi = (id) => {
    return api.post(`api/v1/meeting/${id}/cancel/`)
}

export const completeMeetingApi = (id) => {
    return api.post(`api/v1/meeting/${id}/complete/`)
}