import { useState, useContext, createContext } from 'react'
import {
  getMeetingParticipants,
  addMeetingParticipant,
  deleteMeetingParticipant,
  updateRsvpStatus,
} from '../services/participantApi'

const ParticipantContext = createContext()

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data
  return (
    data?.non_field_errors?.[0] ||
    data?.error ||
    data?.detail ||
    error.message ||
    fallback
  )
}

const ParticipantContextProvider = ({ children }) => {

  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // get
  const ParticipantGet = async (id) => {

    if (!id) return []

    setLoading(true);
    setError(null);

    try {
      const response = await getMeetingParticipants(id)
      setParticipants(response?.data || [])
      return response?.data || []
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch participants')
      setError(message)
      setParticipants([])
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  // post (invite) — API returns only { email }, so refetch for full rows
  const ParticipantAdd = async (id, email) => {

    setLoading(true);
    setError(null);

    try {
      await addMeetingParticipant(id, email)
      const response = await getMeetingParticipants(id)
      setParticipants(response?.data || [])
      return response?.data || []
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  // delete (remove)
  const ParticipantRemove = async (id, participantId) => {

    setLoading(true);
    setError(null);

    try {
      await deleteMeetingParticipant(id, participantId)
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  // rsvp (accept / decline own invitation)
  const RsvpUpdate = async (id, status) => {

    setLoading(true);
    setError(null);

    try {
      const response = await updateRsvpStatus(id, status)
      return response?.data
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  const clearParticipants = () => {
    setParticipants([])
    setError(null)
    setLoading(false)
  }

  const value = {
    participants,
    loading,
    error,
    ParticipantGet,
    ParticipantAdd,
    ParticipantRemove,
    RsvpUpdate,
    clearParticipants,
  }
  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  )
}

export default ParticipantContextProvider
export const useParticipant = () => useContext(ParticipantContext)
