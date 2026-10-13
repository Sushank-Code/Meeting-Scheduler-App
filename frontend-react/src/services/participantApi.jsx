import api from "./apiClient";

export const getMeetingParticipants = (id) => {
    return api.get(`api/v1/meeting/${id}/participants/`)
}

export const addMeetingParticipant = (id, email) => {
    return api.post(`api/v1/meeting/${id}/participants/`, { email })
}

export const deleteMeetingParticipant = (id, participantId) => {
    return api.delete(`api/v1/meeting/${id}/participants/${participantId}/`)
}

export const updateRsvpStatus = (id, rsvp_status) => {
    return api.patch(`api/v1/meeting/${id}/rsvp/`, { rsvp_status })
}