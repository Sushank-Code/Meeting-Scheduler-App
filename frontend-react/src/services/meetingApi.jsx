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

export const getMeetingParticipants = (id) => {
    return api.get(`api/v1/meeting/${id}/participants/`)
}

export const addMeetingParticipant = (id, email) => {
    return api.post(`api/v1/meeting/${id}/participants/`, { email })
}

export const deleteMeetingParticipant = (id, participantId) => {
    return api.delete(`api/v1/meeting/${id}/participants/${participantId}/`)
}

export const cancelMeetingApi = (id) => {
    return api.post(`api/v1/meeting/${id}/cancel/`)
}

export const completeMeetingApi = (id) => {
    return api.post(`api/v1/meeting/${id}/complete/`)
}